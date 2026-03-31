import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { showFieldError, validationMessage } from '../../shared/form-validation';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { PartnershipStoreService } from '../../services/partnership-store.service';

@Component({
  selector: 'app-pa-campings-page',
  templateUrl: './pa-campings-page.component.html',
})
export class PaCampingsPageComponent implements OnInit, OnDestroy {

  rows: Record<string, unknown>[] = [];
  columns = [
    { key: 'id', label: 'ID' },
    { key: 'nom', label: 'Nom' },
    { key: 'localisation', label: 'Localisation' },
    { key: 'capacite', label: 'Capacité' },
    { key: 'partnersLabel', label: 'Partenaires' },
  ];
  searchKeys = ['nom', 'localisation', 'partnersLabel'];
  users: { id: number; label: string }[] = [];
  filterPartnerId: number | null = null;
  filterLoc = '';

  showModal = false;
  editingId: number | null = null;
  selectedPartnerIds: number[] = [];
  partnersBlockError = false;
  form!: ReturnType<FormBuilder['group']>;  // ✅ déclaré sans initialisation

  private sub?: Subscription;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: PartnershipStoreService,
    private readonly toast: ToastrService,
  ) {
    // ✅ initialisé dans le constructeur
    this.form = this.fb.group({
      nom:          ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      localisation: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(500)]],
      capacite:     [0,  [Validators.required, Validators.min(1), Validators.max(100000)]],
    });
  }

  ngOnInit(): void {
    this.sub = this.store.observe().subscribe(() => this.rebuildRows());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  applyFilters(): void {
    this.rebuildRows();
  }

  private rebuildRows(): void {
    const s = this.store.snapshot();
    this.users = s.users.map((u) => ({ id: u.id, label: `${u.firstName} ${u.lastName}` }));
    let list = s.campings;
    if (this.filterPartnerId != null) {
      list = list.filter((c) => c.partnerIds.includes(this.filterPartnerId!));
    }
    if (this.filterLoc.trim()) {
      const q = this.filterLoc.trim().toLowerCase();
      list = list.filter((c) => c.localisation.toLowerCase().includes(q));
    }
    this.rows = list.map((c) => ({
      ...c,
      partnersLabel: c.partnerIds.map((id) => s.users.find((u) => u.id === id)?.lastName || id).join(', '),
    }));
  }

  togglePartner(id: number): void {
    if (this.selectedPartnerIds.includes(id)) {
      this.selectedPartnerIds = this.selectedPartnerIds.filter((x) => x !== id);
    } else {
      this.selectedPartnerIds = [...this.selectedPartnerIds, id];
    }
    if (this.selectedPartnerIds.length > 0) this.partnersBlockError = false;
  }

  invalidField(name: string): boolean {
    return showFieldError(this.form.get(name));
  }

  msgField(name: string): string {
    const c = this.form.get(name);
    return c?.errors ? validationMessage(c.errors) : '';
  }

  openCreate(): void {
    this.editingId = null;
    this.selectedPartnerIds = [];
    this.partnersBlockError = false;
    this.form.reset({ nom: '', localisation: '', capacite: 50 });
    this.showModal = true;
    this.form.markAsUntouched();
  }

  openEdit(row: Record<string, unknown>): void {
    const c = this.store.snapshot().campings.find((x) => x.id === row['id']);
    if (!c) return;
    this.editingId = c.id;
    this.selectedPartnerIds = [...c.partnerIds];
    this.partnersBlockError = false;
    this.form.patchValue({ nom: c.nom, localisation: c.localisation, capacite: c.capacite });
    this.showModal = true;
    this.form.markAsUntouched();
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.toast.warning('Veuillez corriger les erreurs du formulaire.');
      return;
    }
    if (this.selectedPartnerIds.length === 0) {
      this.partnersBlockError = true;
      this.toast.warning('Sélectionnez au moins un partenaire.');
      return;
    }
    const v = this.form.getRawValue();
    const base = { nom: v.nom!, localisation: v.localisation!, capacite: Number(v.capacite), partnerIds: [...this.selectedPartnerIds] };
    if (this.editingId != null) {
      this.store.updateCamping(this.editingId, base);
      this.toast.success('Camping mis à jour');
    } else {
      this.store.addCamping(base);
      this.toast.success('Camping créé');
    }
    this.showModal = false;
  }

  remove(row: Record<string, unknown>): void {
    if (confirm('Supprimer ce camping ?')) {
      this.store.deleteCamping(row['id'] as number);
      this.toast.success('Camping supprimé');
    }
  }

  isPartnerChecked(id: number): boolean {
    return this.selectedPartnerIds.includes(id);
  }
}
