import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ContratStatut } from '../../models/partnership.models';
import { PartnershipStoreService } from '../../services/partnership-store.service';
import { contratDateOrderValidator, showFieldError, validationMessage } from '../../shared/form-validation';

@Component({
  selector: 'app-pa-contrats-page',
  templateUrl: './pa-contrats-page.component.html',
})
export class PaContratsPageComponent implements OnInit, OnDestroy {

  readonly validationMessage = validationMessage;

  rows: Record<string, unknown>[] = [];
  columns = [
    { key: 'id', label: 'ID' },
    { key: 'partenaireLabel', label: 'Partenaire' },
    { key: 'offreLabel', label: 'Offre' },
    { key: 'montant', label: 'Montant' },
    { key: 'commission', label: 'Commission' },
    { key: 'dateDebut', label: 'Début' },
    { key: 'dateFin', label: 'Fin' },
    { key: 'statut', label: 'Statut' },
  ];
  searchKeys = ['partenaireLabel', 'offreLabel', 'statut'];
  users: { id: number; label: string }[] = [];
  offres: { id: number; label: string }[] = [];
  filterPartnerId: number | null = null;
  filterStatut: ContratStatut | null = null;
  statuts: ContratStatut[] = ['EN_COURS', 'EXPIRE', 'RESILIE'];

  showModal = false;
  editingId: number | null = null;
  form!: FormGroup;

  private sub?: Subscription;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: PartnershipStoreService,
    private readonly toast: ToastrService,
  ) {
    this.form = this.fb.group(
      {
        partenaireId:    [null as number | null, Validators.required],
        offreId:         [null as number | null, Validators.required],
        montant:         [0, [Validators.required, Validators.min(0), Validators.max(999999999)]],
        dateDebut:       ['', Validators.required],
        dateFin:         ['', Validators.required],
        statut:          ['EN_COURS' as ContratStatut, Validators.required],
        tauxCommission:  [10, [Validators.required, Validators.min(0), Validators.max(100)]],
      },
      { validators: [contratDateOrderValidator] },
    );
  }

  ngOnInit(): void {
    this.sub = this.store.observe().subscribe(() => this.rebuild());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private rebuild(): void {
    const s = this.store.snapshot();
    this.users = s.users.map((u) => ({ id: u.id, label: `${u.firstName} ${u.lastName}` }));
    this.offres = s.offres.map((o) => ({ id: o.id, label: o.titre }));
    let list = s.contrats;
    if (this.filterPartnerId != null) {
      list = list.filter((c) => c.partenaireId === this.filterPartnerId);
    }
    if (this.filterStatut != null) {
      list = list.filter((c) => c.statut === this.filterStatut);
    }
    this.rows = list.map((c) => {
      const commission = this.store.commissionMontant(c);
      return {
        ...c,
        partenaireLabel: s.users.find((u) => u.id === c.partenaireId)?.lastName || c.partenaireId,
        offreLabel: s.offres.find((o) => o.id === c.offreId)?.titre || c.offreId,
        commission: commission.toFixed(2) + ' TND',
      };
    });
  }

  applyFilters(): void {
    this.rebuild();
  }

  openCreate(): void {
    this.editingId = null;
    this.form.reset({
      partenaireId: null,
      offreId: null,
      montant: 0,
      dateDebut: '',
      dateFin: '',
      statut: 'EN_COURS',
      tauxCommission: 10,
    });
    this.showModal = true;
  }

  openEdit(row: Record<string, unknown>): void {
    const c = this.store.snapshot().contrats.find((x) => x.id === row['id']);
    if (!c) return;
    this.editingId = c.id;
    this.form.patchValue(c);
    this.showModal = true;
  }

  invalidField(name: string): boolean {
    return showFieldError(this.form.get(name));
  }

  messageField(name: string): string {
    const c = this.form.get(name);
    return c?.errors ? validationMessage(c.errors) : '';
  }

  invalidDates(): boolean {
    return this.form.hasError('dateOrder') && (this.form.touched || this.form.dirty);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Veuillez corriger les erreurs du formulaire.');
      return;
    }
    const v = this.form.getRawValue();
    const payload = {
      partenaireId:   Number(v.partenaireId),
      offreId:        Number(v.offreId),
      montant:        Number(v.montant),
      dateDebut:      v.dateDebut!,
      dateFin:        v.dateFin!,
      statut:         v.statut as ContratStatut,
      tauxCommission: Number(v.tauxCommission),
    };
    if (this.editingId != null) {
      this.store.updateContrat(this.editingId, payload);
      this.toast.success('Contrat mis à jour');
    } else {
      this.store.addContrat(payload);
      this.toast.success('Contrat créé');
    }
    this.showModal = false;
  }

  remove(row: Record<string, unknown>): void {
    if (confirm('Supprimer ce contrat ?')) {
      this.store.deleteContrat(row['id'] as number);
      this.toast.success('Contrat supprimé');
    }
  }
}
