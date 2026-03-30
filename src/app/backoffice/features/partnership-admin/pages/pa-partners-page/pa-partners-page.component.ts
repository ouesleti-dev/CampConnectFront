import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PHONE_PATTERN, showFieldError, validationMessage } from '../../shared/form-validation';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { PartnerUser } from '../../models/partnership.models';
import { PartnershipStoreService } from '../../services/partnership-store.service';

@Component({
  selector: 'app-pa-partners-page',
  templateUrl: './pa-partners-page.component.html',
})
export class PaPartnersPageComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);

  rows: Record<string, unknown>[] = [];
  columns = [
    { key: 'id', label: 'ID' },
    { key: 'firstName', label: 'Prénom' },
    { key: 'lastName', label: 'Nom' },
    { key: 'email', label: 'Email' },
    { key: 'score', label: 'Score' },
    { key: 'actif', label: 'Actif' },
  ];
  searchKeys = ['firstName', 'lastName', 'email'];

  showModal = false;
  editingId: number | null = null;
  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(180)]],
    phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
    /** Optionnel : à la création, vide = mot de passe par défaut côté serveur. */
    password: [''],
    score: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    actif: [true],
  });

  private sub?: Subscription;

  constructor(
    private store: PartnershipStoreService,
    private toast: ToastrService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.sub = this.store.observe().subscribe((s) => {
      this.rows = s.users.map((u) => ({
        ...u,
        actif: u.actif ? 'Oui' : 'Non',
      }));
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  openCreate(): void {
    this.editingId = null;
    this.form.reset({ firstName: '', lastName: '', email: '', phone: '', password: '', score: 0, actif: true });
    this.showModal = true;
    this.form.markAsUntouched();
  }

  openEdit(row: Record<string, unknown>): void {
    const u = this.store.snapshot().users.find((x) => x.id === row['id']);
    if (!u) return;
    this.editingId = u.id;
    this.form.patchValue({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      password: '',
      score: u.score,
      actif: u.actif,
    });
    this.showModal = true;
    this.form.markAsUntouched();
  }

  invalidField(name: string): boolean {
    return showFieldError(this.form.get(name));
  }

  msgField(name: string): string {
    const c = this.form.get(name);
    return c?.errors ? validationMessage(c.errors) : '';
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Veuillez corriger les erreurs du formulaire.');
      return;
    }
    const v = this.form.getRawValue();
    const pwd = (v.password || '').trim();
    const payload: Omit<PartnerUser, 'id'> & { password?: string } = {
      firstName: v.firstName!,
      lastName: v.lastName!,
      email: v.email!,
      phone: v.phone!,
      score: Number(v.score),
      actif: !!v.actif,
    };
    if (pwd.length > 0 && pwd.length < 6) {
      this.toast.warning('Le mot de passe doit faire au moins 6 caractères (ou laisser vide).');
      return;
    }
    if (pwd.length > 0) {
      payload.password = pwd;
    }
    if (this.editingId != null) {
      this.store.updateUser(this.editingId, payload);
      this.toast.success('Partenaire mis à jour');
    } else {
      this.store.addUser(payload);
      this.toast.success('Partenaire créé');
    }
    this.showModal = false;
  }

  remove(row: Record<string, unknown>): void {
    const id = row['id'] as number;
    if (confirm('Supprimer ce partenaire ?')) {
      this.store.deleteUser(id);
      this.toast.success('Partenaire supprimé');
    }
  }

  goDetail(row: Record<string, unknown>): void {
    this.router.navigate(['/admin/partnership-admin/partenaires', row['id']]);
  }
}
