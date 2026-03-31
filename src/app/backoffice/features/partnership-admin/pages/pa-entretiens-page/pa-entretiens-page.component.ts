import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { EntretienDecision, EntretienMode } from '../../models/partnership.models';
import { PartnershipStoreService } from '../../services/partnership-store.service';
import { showFieldError, validationMessage } from '../../shared/form-validation';

@Component({
  selector: 'app-pa-entretiens-page',
  templateUrl: './pa-entretiens-page.component.html',
})
export class PaEntretiensPageComponent implements OnInit, OnDestroy {

  rows: Record<string, unknown>[] = [];
  columns = [
    { key: 'id', label: 'ID' },
    { key: 'partenaireLabel', label: 'Partenaire' },
    { key: 'date', label: 'Date' },
    { key: 'mode', label: 'Mode' },
    { key: 'decision', label: 'Décision' },
    { key: 'scoreGlobal', label: 'Score' },
  ];
  searchKeys = ['partenaireLabel', 'mode', 'decision'];
  users: { id: number; label: string }[] = [];
  filterPartnerId: number | null = null;
  modes: EntretienMode[] = ['PRESENTIEL', 'VISIO', 'TELEPHONE'];
  decisions: EntretienDecision[] = ['VALIDER', 'REFUSER', 'A_AMELIORER'];

  showModal = false;
  editingId: number | null = null;
  form!: FormGroup;

  private sub?: Subscription;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: PartnershipStoreService,
    private readonly toast: ToastrService,
  ) {
    this.form = this.fb.group({
      partenaireId: [null as number | null, Validators.required],
      date:         ['', Validators.required],
      mode:         ['VISIO' as EntretienMode, Validators.required],
      decision:     ['VALIDER' as EntretienDecision, Validators.required],
      scoreGlobal:  [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    });
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
    let list = s.entretiens;
    if (this.filterPartnerId != null) {
      list = list.filter((e) => e.partenaireId === this.filterPartnerId);
    }
    this.rows = list
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((e) => ({
        ...e,
        partenaireLabel: s.users.find((u) => u.id === e.partenaireId)?.lastName || e.partenaireId,
      }));
  }

  applyFilter(): void {
    this.rebuild();
  }

  historiqueForPartner(pid: number | null): void {
    this.filterPartnerId = pid;
    this.applyFilter();
  }

  openCreate(): void {
    this.editingId = null;
    this.form.reset({
      partenaireId: null,
      date: new Date().toISOString().slice(0, 10),
      mode: 'VISIO',
      decision: 'VALIDER',
      scoreGlobal: 70,
    });
    this.showModal = true;
  }

  openEdit(row: Record<string, unknown>): void {
    const e = this.store.snapshot().entretiens.find((x) => x.id === row['id']);
    if (!e) return;
    this.editingId = e.id;
    this.form.patchValue(e);
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
      partenaireId: Number(v.partenaireId),
      date:         v.date!,
      mode:         v.mode as EntretienMode,
      decision:     v.decision as EntretienDecision,
      scoreGlobal:  Number(v.scoreGlobal),
    };
    if (this.editingId != null) {
      this.store.updateEntretien(this.editingId, payload);
      this.toast.success('Entretien mis à jour');
    } else {
      this.store.addEntretien(payload);
      this.toast.success('Entretien planifié');
    }
    this.showModal = false;
  }

  remove(row: Record<string, unknown>): void {
    if (confirm('Supprimer cet entretien ?')) {
      this.store.deleteEntretien(row['id'] as number);
      this.toast.success('Entretien supprimé');
    }
  }
}