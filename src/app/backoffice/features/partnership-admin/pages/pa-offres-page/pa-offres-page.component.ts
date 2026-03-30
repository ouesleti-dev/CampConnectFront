import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ChartConfiguration } from 'chart.js';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { OffreStatut } from '../../models/partnership.models';
import { PartnershipStoreService } from '../../services/partnership-store.service';
import { showFieldError, validationMessage } from '../../shared/form-validation';

@Component({
  selector: 'app-pa-offres-page',
  templateUrl: './pa-offres-page.component.html',
})
export class PaOffresPageComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);

  rows: Record<string, unknown>[] = [];
  columns = [
    { key: 'id', label: 'ID' },
    { key: 'titre', label: 'Titre' },
    { key: 'campingNom', label: 'Camping' },
    { key: 'datePublication', label: 'Date' },
    { key: 'statut', label: 'Statut' },
  ];
  searchKeys = ['titre', 'campingNom', 'statut'];
  campings: { id: number; label: string }[] = [];
  users: { id: number; label: string }[] = [];
  filterStatut: OffreStatut | null = null;
  filterPartnerId: number | null = null;
  chartConfig?: ChartConfiguration;

  showModal = false;
  editingId: number | null = null;
  form = this.fb.group({
    titre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
    description: ['', Validators.maxLength(2000)],
    campingId: [null as number | null, Validators.required],
    datePublication: ['', Validators.required],
    statut: ['PROPOSEE' as OffreStatut, Validators.required],
  });

  statuts: OffreStatut[] = ['PROPOSEE', 'ACCEPTEE', 'REFUSEE', 'EXPIREE'];
  private sub?: Subscription;

  constructor(
    private store: PartnershipStoreService,
    private toast: ToastrService,
  ) {}

  ngOnInit(): void {
    this.sub = this.store.observe().subscribe(() => this.rebuild());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private rebuild(): void {
    const s = this.store.snapshot();
    this.campings = s.campings.map((c) => ({ id: c.id, label: c.nom }));
    this.users = s.users.map((u) => ({ id: u.id, label: `${u.firstName} ${u.lastName}` }));
    let list = s.offres;
    if (this.filterStatut != null) {
      list = list.filter((o) => o.statut === this.filterStatut);
    }
    if (this.filterPartnerId != null) {
      const campIds = new Set(s.campings.filter((c) => c.partnerIds.includes(this.filterPartnerId!)).map((c) => c.id));
      list = list.filter((o) => campIds.has(o.campingId));
    }
    this.rows = list.map((o) => ({
      ...o,
      campingNom: s.campings.find((c) => c.id === o.campingId)?.nom || o.campingId,
    }));
    const statuts = this.statuts;
    const counts = statuts.map((st) => s.offres.filter((o) => o.statut === st).length);
    this.chartConfig = {
      type: 'bar',
      data: { labels: statuts, datasets: [{ label: 'Offres', data: counts, backgroundColor: '#6ea8fe' }] },
      options: { plugins: { legend: { display: false } }, maintainAspectRatio: false },
    };
  }

  applyFilters(): void {
    this.rebuild();
  }

  openCreate(): void {
    this.editingId = null;
    this.form.reset({ titre: '', description: '', campingId: null, datePublication: new Date().toISOString().slice(0, 10), statut: 'PROPOSEE' });
    this.showModal = true;
  }

  openEdit(row: Record<string, unknown>): void {
    const o = this.store.snapshot().offres.find((x) => x.id === row['id']);
    if (!o) return;
    this.editingId = o.id;
    this.form.patchValue({
      titre: o.titre,
      description: o.description,
      campingId: o.campingId,
      datePublication: o.datePublication,
      statut: o.statut,
    });
    this.showModal = true;
  }

  invalidField(name: string): boolean {
    return showFieldError(this.form.get(name));
  }

  messageField(name: string): string {
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
    const payload = {
      titre: v.titre!,
      description: v.description || '',
      campingId: Number(v.campingId),
      datePublication: v.datePublication!,
      statut: v.statut as OffreStatut,
    };
    if (this.editingId != null) {
      this.store.updateOffre(this.editingId, payload);
      this.toast.success('Offre mise à jour');
    } else {
      this.store.addOffre(payload);
      this.toast.success('Offre créée');
    }
    this.showModal = false;
  }

  remove(row: Record<string, unknown>): void {
    if (confirm('Supprimer cette offre ?')) {
      this.store.deleteOffre(row['id'] as number);
      this.toast.success('Offre supprimée');
    }
  }
}
