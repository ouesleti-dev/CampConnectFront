import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { EntretienMode } from '../../models/partnership.models';
import { PartnershipStoreService } from '../../services/partnership-store.service';
import { showFieldError, validationMessage } from '../../shared/form-validation';

@Component({
  selector: 'app-pa-rencontres-page',
  templateUrl: './pa-rencontres-page.component.html',
})
export class PaRencontresPageComponent implements OnInit, OnDestroy {

  rows: Record<string, unknown>[] = [];
  columns = [
    { key: 'id', label: 'ID' },
    { key: 'entretienLabel', label: 'Entretien' },
    { key: 'date', label: 'Date' },
    { key: 'mode', label: 'Mode' },
    { key: 'compteRenduShort', label: 'Compte rendu' },
  ];
  searchKeys = ['entretienLabel', 'compteRenduShort', 'mode'];
  entretiens: { id: number; label: string }[] = [];
  filterEntretienId: number | null = null;
  modes: EntretienMode[] = ['PRESENTIEL', 'VISIO', 'TELEPHONE'];

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
      entretienId: [null as number | null, Validators.required],
      date:        ['', Validators.required],
      mode:        ['VISIO' as EntretienMode, Validators.required],
      compteRendu: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5000)]],
    });
  }

  ngOnInit(): void {
    this.sub = this.store.observe().subscribe(() => this.rebuild());
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  private rebuild(): void {
    const s = this.store.snapshot();
    this.entretiens = s.entretiens.map((e) => ({
      id: e.id,
      label: `#${e.id} — ${s.users.find((u) => u.id === e.partenaireId)?.lastName || e.partenaireId} (${e.date})`,
    }));
    let list = s.rencontres;
    if (this.filterEntretienId != null) list = list.filter((r) => r.entretienId === this.filterEntretienId);
    this.rows = list.slice().sort((a, b) => b.date.localeCompare(a.date)).map((r) => ({
      ...r,
      entretienLabel: this.entretiens.find((e) => e.id === r.entretienId)?.label || r.entretienId,
      compteRenduShort: r.compteRendu.length > 60 ? r.compteRendu.slice(0, 60) + '…' : r.compteRendu,
    }));
  }

  applyFilter(): void { this.rebuild(); }
  rencontresForEntretien(eid: number): void { this.filterEntretienId = eid; this.applyFilter(); }

  openCreate(): void {
    this.editingId = null;
    this.form.reset({ entretienId: this.filterEntretienId, date: new Date().toISOString().slice(0, 10), mode: 'VISIO', compteRendu: '' });
    this.showModal = true;
  }

  openEdit(row: Record<string, unknown>): void {
    const r = this.store.snapshot().rencontres.find((x) => x.id === row['id']);
    if (!r) return;
    this.editingId = r.id;
    this.form.patchValue(r);
    this.showModal = true;
  }

  invalidField(name: string): boolean { return showFieldError(this.form.get(name)); }
  messageField(name: string): string { const c = this.form.get(name); return c?.errors ? validationMessage(c.errors) : ''; }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); this.toast.warning('Veuillez corriger les erreurs du formulaire.'); return; }
    const v = this.form.getRawValue();
    const payload = { entretienId: Number(v.entretienId), date: v.date!, mode: v.mode as EntretienMode, compteRendu: v.compteRendu! };
    if (this.editingId != null) { this.store.updateRencontre(this.editingId, payload); this.toast.success('Rencontre mise à jour'); }
    else { this.store.addRencontre(payload); this.toast.success('Rencontre ajoutée'); }
    this.showModal = false;
  }

  remove(row: Record<string, unknown>): void {
    if (confirm('Supprimer cette rencontre ?')) { this.store.deleteRencontre(row['id'] as number); this.toast.success('Rencontre supprimée'); }
  }
}