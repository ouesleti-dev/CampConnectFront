import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  rows: Record<string, unknown>[] = [];
  columns = [
    { key: 'id', label: 'ID' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'score', label: 'Score' },
    { key: 'actif', label: 'Status' },
  ];
  searchKeys = ['firstName', 'lastName', 'email'];

  // ── Stats ─────────────────────────────────────────────────
  totalPartners = 0;
  activePartners = 0;
  avgScore = 0;
  topPerformers = 0;

  showModal = false;
  editingId: number | null = null;
  form!: FormGroup;

  private sub?: Subscription;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: PartnershipStoreService,
    private readonly toast: ToastrService,
    private readonly router: Router,
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
      lastName:  ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
      email:     ['', [Validators.required, Validators.email, Validators.maxLength(180)]],
      phone:     ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
      password:  [''],
      score:     [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      actif:     [true],
    });
  }

  ngOnInit(): void {
    this.sub = this.store.observe().subscribe((s) => {
      this.rebuild(s.users);
    });
  }

  private rebuild(users: PartnerUser[]): void {
    this.rows = users.map((u) => ({ 
      ...u, 
      actif: u.actif ? 'Active' : 'Inactive' 
    }));

    // Stats
    this.totalPartners = users.length;
    this.activePartners = users.filter(u => u.actif).length;
    this.avgScore = users.length 
      ? Math.round(users.reduce((acc, u) => acc + u.score, 0) / users.length) 
      : 0;
    this.topPerformers = users.filter(u => u.score >= 80).length;
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

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
    this.form.patchValue({ firstName: u.firstName, lastName: u.lastName, email: u.email, phone: u.phone, password: '', score: u.score, actif: u.actif });
    this.showModal = true;
    this.form.markAsUntouched();
  }

  invalidField(name: string): boolean { return showFieldError(this.form.get(name)); }
  msgField(name: string): string {
    const c = this.form.get(name);
    return c?.errors ? validationMessage(c.errors) : '';
  }

  save(): void {
    if (this.form.invalid) { 
      this.form.markAllAsTouched(); 
      this.toast.warning('Please correct the form errors.'); 
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
      this.toast.warning('Password must be at least 6 characters.'); 
      return; 
    }
    if (pwd.length > 0) payload.password = pwd;

    if (this.editingId != null) { 
      this.store.updateUser(this.editingId, payload); 
      this.toast.success('Partner updated'); 
    } else { 
      this.store.addUser(payload); 
      this.toast.success('Partner created'); 
    }
    this.showModal = false;
  }

  remove(row: Record<string, unknown>): void {
    if (confirm('Delete this partner?')) { 
      this.store.deleteUser(row['id'] as number); 
      this.toast.success('Partner deleted'); 
    }
  }

  goDetail(row: Record<string, unknown>): void {
    this.router.navigate(['/admin/partnership-admin/partenaires', row['id']]);
  }

}