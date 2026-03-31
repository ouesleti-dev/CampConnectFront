import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment';
import { AuthService } from '../../../../shared/services/auth.service';
import { PartnerUser } from '../../../../../backoffice/features/partnership-admin/models/partnership.models';
import { PartnershipHttpService } from '../../../../../backoffice/features/partnership-admin/services/partnership-http.service';
import { PartnerUserSummaryApi } from '../../../../../backoffice/features/partnership-admin/services/partnership-api.types';
import { buildPartnerUserWriteBody } from '../../../../../backoffice/features/partnership-admin/services/partnership-mapper';
import {
  PHONE_PATTERN,
  showFieldError,
  validationMessage,
} from '../../../../../backoffice/features/partnership-admin/shared/form-validation';

const BIOS = [
  "Partenaire engagé dans le réseau CampConnect, passionné par l'accueil durable et les séjours en pleine nature.",
  "Professionnel du secteur outdoor et du camping, il contribue à enrichir l'offre et la qualité des expériences proposées.",
  "Impliqué dans le développement de la communauté CampConnect grâce à son expertise terrain et sa vision client.",
  "Ambassadeur de pratiques responsables : accompagnement des campeurs, partage de bonnes pratiques et innovation sur les sites partenaires.",
  "Entrepreneur à l'écoute des voyageurs, il renforce les liens entre campings, services et mobilité douce sur la plateforme.",
];

@Component({
  selector: 'app-partnerships-page',
  templateUrl: './partnerships-page.component.html',
  styleUrl: './partnerships-page.component.css',
})
export class PartnershipsPageComponent implements OnInit {

  loading = false;
  partners: PartnerUserSummaryApi[] = [];
  searchQuery = '';
  selected: PartnerUserSummaryApi | null = null;
  showAddModal = false;
  addSubmitting = false;
  addForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly api: PartnershipHttpService,
    private readonly toast: ToastrService,
    private readonly auth: AuthService,
  ) {
    this.addForm = this.fb.nonNullable.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
      lastName:  ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
      email:     ['', [Validators.required, Validators.email, Validators.maxLength(180)]],
      phone:     ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
      password:  [''],
      actif:     [true],
    });
  }

  get canAddPartner(): boolean {
    const r = this.auth.getRole();
    return r === 'ROLE_ADMIN' || r === 'ROLE_PARTNER';
  }

  ngOnInit(): void {
    this.loadPartners();
  }

  get filteredPartners(): PartnerUserSummaryApi[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.partners;
    return this.partners.filter((p) => {
      const hay = `${p.firstName} ${p.lastName} ${p.email} ${p.phone ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }

  loadPartners(): void {
    if (!environment.useBackendPartnership) {
      this.toast.warning('Les données partenaires ne sont pas disponibles (API désactivée).');
      return;
    }
    this.loading = true;
    this.api
      .getPartnerUsers()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (rows) => (this.partners = [...rows].sort((a, b) => a.lastName.localeCompare(b.lastName))),
        error: () =>
          this.toast.error(
            'Impossible de charger les partenaires. Vérifiez que le backend tourne et que vous êtes connecté.',
          ),
      });
  }

  trackById(_: number, p: PartnerUserSummaryApi): number {
    return p.id;
  }

  initials(p: PartnerUserSummaryApi): string {
    const a = (p.firstName || '').trim().charAt(0);
    const b = (p.lastName || '').trim().charAt(0);
    return `${a}${b}`.toUpperCase() || '?';
  }

  fullName(p: PartnerUserSummaryApi): string {
    return `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || 'Partenaire';
  }

  avatarStyle(p: PartnerUserSummaryApi): { [key: string]: string } {
    const hue = (p.id * 47) % 360;
    const hue2 = (hue + 40) % 360;
    return {
      background: `linear-gradient(145deg, hsl(${hue}, 42%, 38%) 0%, hsl(${hue2}, 35%, 52%) 100%)`,
    };
  }

  roleLabel(p: PartnerUserSummaryApi): string {
    return p.actif ? 'Partenaire CampConnect' : 'Partenaire (compte inactif)';
  }

  bio(p: PartnerUserSummaryApi): string {
    const idx = Math.abs(p.id) % BIOS.length;
    return BIOS[idx] ?? BIOS[0];
  }

  openDetail(p: PartnerUserSummaryApi): void {
    this.showAddModal = false;
    this.selected = p;
    document.body.style.overflow = 'hidden';
  }

  closeDetail(): void {
    this.selected = null;
    document.body.style.overflow = this.showAddModal ? 'hidden' : '';
  }

  openAddModal(): void {
    this.closeDetail();
    this.addForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      actif: true,
    });
    this.addForm.markAsUntouched();
    this.showAddModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeAddModal(): void {
    this.showAddModal = false;
    document.body.style.overflow = this.selected ? 'hidden' : '';
  }

  addFieldError(controlName: string): string {
    const c = this.addForm.get(controlName);
    return showFieldError(c) ? validationMessage(c!.errors) : '';
  }

  submitAdd(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    const v = this.addForm.getRawValue();
    const payload: Omit<PartnerUser, 'id'> & { password?: string } = {
      firstName: v.firstName.trim(),
      lastName: v.lastName.trim(),
      email: v.email.trim(),
      phone: v.phone.trim(),
      actif: v.actif,
      score: 0,
      password: v.password?.trim() || undefined,
    };
    this.addSubmitting = true;
    this.api
      .createPartnerUser(buildPartnerUserWriteBody(payload))
      .pipe(finalize(() => (this.addSubmitting = false)))
      .subscribe({
        next: () => {
          this.toast.success('Partenaire créé avec succès.');
          this.closeAddModal();
          this.loadPartners();
        },
        error: (err: unknown) => this.toast.error(this.createPartnerErrorMessage(err)),
      });
  }

  private createPartnerErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      if (body && typeof body === 'object' && 'error' in body) {
        const msg = (body as { error?: unknown }).error;
        if (typeof msg === 'string' && msg.trim()) return msg;
      }
      if (err.status === 403) return 'Création réservée aux rôles administrateur ou partenaire.';
      if (err.status === 401) return 'Session expirée. Reconnectez-vous.';
    }
    return 'Impossible de créer le partenaire.';
  }

  linkedinSearchUrl(p: PartnerUserSummaryApi): string {
    const q = encodeURIComponent(`${p.firstName} ${p.lastName}`.trim());
    return `https://www.linkedin.com/search/results/people/?keywords=${q}`;
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.showAddModal) {
      this.closeAddModal();
      return;
    }
    if (this.selected) this.closeDetail();
  }
}