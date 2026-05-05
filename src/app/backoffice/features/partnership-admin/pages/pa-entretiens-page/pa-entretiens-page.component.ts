import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { EntretienDecision, EntretienMode, Entretien, PartnerUser } from '../../models/partnership.models';
import { PartnershipStoreService } from '../../services/partnership-store.service';
import { showFieldError, validationMessage } from '../../shared/form-validation';

export type CalendarView = 'month' | 'week' | 'day' | 'list';
export type WorkflowStep = 'screening' | 'rh' | 'technique' | 'validation';

export interface TimeSlot {
  hour: number;
  minute: number;
  label: string;
  available: boolean;
}

export interface CalendarDay {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  events: CalendarEvent[];
}

export interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  hour: number;
  duration: number; // minutes
  mode: EntretienMode;
  decision: EntretienDecision;
  score: number;
  partenaireId: number;
  partenaireLabel: string;
  color: string;
  workflowStep: WorkflowStep;
  conflictDetected?: boolean;
}

export interface ConflictAlert {
  eventA: CalendarEvent;
  eventB: CalendarEvent;
  message: string;
}

@Component({
  selector: 'app-pa-entretiens-page',
  templateUrl: './pa-entretiens-page.component.html',
  styleUrls: ['./pa-entretiens-page.component.css'],
})
export class PaEntretiensPageComponent implements OnInit, OnDestroy {

  // ── Expert Features ───────────────────────────────────────
  currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  externalSyncConnected = false;
  publicBookingUrl = '';
  workingHours = { start: 9, end: 18 };

  // ── View state ────────────────────────────────────────────
  activeTab: 'calendar' | 'availability' | 'settings' = 'calendar';
  activeView: CalendarView = 'month';
  currentDate = new Date();
  calendarDays: CalendarDay[] = [];
  weekDays: CalendarDay[] = [];
  timeSlots: TimeSlot[] = [];
  allEvents: CalendarEvent[] = [];
  conflicts: ConflictAlert[] = [];

  // ── Stats ─────────────────────────────────────────────────
  totalEntretiens = 0;
  occupancyRate = 0;
  avgScore = 0;
  noShowCount = 0;
  avgDuration = 0;
  noShowRate = 0;

  // ── List view ─────────────────────────────────────────────
  rows: Record<string, unknown>[] = [];
  columns = [
    { key: 'id', label: 'ID' },
    { key: 'partenaireLabel', label: 'Candidate/Partner' },
    { key: 'intervenantLabel', label: 'Recruiter' },
    { key: 'date', label: 'Date' },
    { key: 'workflowStep', label: 'Step' },
    { key: 'mode', label: 'Mode' },
    { key: 'decision', label: 'Decision' },
  ];
  searchKeys = ['partenaireLabel', 'intervenantLabel', 'mode', 'decision', 'workflowStep'];

  // ── Form ──────────────────────────────────────────────────
  showModal = false;
  showSlotPicker = false;
  editingId: number | null = null;
  form!: FormGroup;
  suggestedSlots: string[] = [];

  // ── Data ──────────────────────────────────────────────────
  users: { id: number; label: string }[] = [];
  recruiters = [
    { id: 101, label: 'Jean RH', role: 'Recruteur' },
    { id: 102, label: 'Marie Tech', role: 'Tech Lead' },
    { id: 103, label: 'Pierre Manager', role: 'Manager' }
  ];
  filterPartnerId: number | null = null;
  modes: EntretienMode[] = ['PRESENTIEL', 'VISIO', 'TELEPHONE'];
  decisions: EntretienDecision[] = ['VALIDER', 'REFUSER', 'A_AMELIORER'];
  workflowSteps: WorkflowStep[] = ['screening', 'rh', 'technique', 'validation'];

  readonly WORKFLOW_LABELS: Record<WorkflowStep, string> = {
    screening: '🔍 Screening',
    rh: '👥 HR Interview',
    technique: '⚙️ Technical',
    validation: '✅ Validation',
  };

  readonly MODE_COLORS: Record<EntretienMode, string> = {
    PRESENTIEL: '#10b981',
    VISIO: '#3b82f6',
    TELEPHONE: '#8b5cf6',
  };

  readonly DECISION_COLORS: Record<EntretienDecision, string> = {
    VALIDER: '#10b981',
    REFUSER: '#ef4444',
    A_AMELIORER: '#f59e0b',
  };

  private sub?: Subscription;
  private entretiens: Entretien[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: PartnershipStoreService,
    private readonly toast: ToastrService,
  ) {
    this.form = this.fb.group({
      partenaireId: [null as number | null, Validators.required],
      intervenantId: [null as number | null, Validators.required],
      date: [new Date().toISOString().slice(0, 10), Validators.required],
      heure: ['09:00', Validators.required],
      duree: [45, [Validators.required, Validators.min(15)]],
      mode: ['VISIO' as EntretienMode, Validators.required],
      decision: ['VALIDER' as EntretienDecision, Validators.required],
      scoreGlobal: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      workflowStep: ['screening' as WorkflowStep, Validators.required],
      notes: [''],
    });
    this.buildTimeSlots();
  }

  ngOnInit(): void {
    this.sub = this.store.observe().subscribe(() => this.rebuild());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // ── Workflow Automation ───────────────────────────────────
  triggerNextStep(entretien: Entretien): void {
    const currentIndex = this.workflowSteps.indexOf(entretien.workflowStep as WorkflowStep);
    if (currentIndex < this.workflowSteps.length - 1) {
      const nextStep = this.workflowSteps[currentIndex + 1];
      this.toast.info(`Initializing step: ${this.WORKFLOW_LABELS[nextStep]}`);
      
      this.openCreate();
      this.form.patchValue({
        partenaireId: entretien.partenaireId,
        workflowStep: nextStep,
        mode: 'VISIO',
        date: new Date().toISOString().slice(0, 10)
      });
    } else {
      this.toast.success('Recruitment process completed for this candidate!');
    }
  }

  // ── Expert Actions ────────────────────────────────────────
  toggleSync(): void {
    this.externalSyncConnected = !this.externalSyncConnected;
    const msg = this.externalSyncConnected ? 'Calendar synchronized (Google/Outlook)' : 'Synchronization disabled';
    this.toast.info(msg);
  }

  generatePublicLink(): void {
    const random = Math.random().toString(36).substring(7);
    this.publicBookingUrl = `https://campconnect.app/book/recruiter-99-${random}`;
    this.toast.success('Public link generated successfully!');
  }

  copyLink(): void {
    navigator.clipboard.writeText(this.publicBookingUrl);
    this.toast.success('Link copied to clipboard');
  }

  updateWorkingHours(start: number, end: number): void {
    this.workingHours = { start, end };
    this.buildTimeSlots();
    this.toast.success('Working hours updated');
  }

  // ── Build ─────────────────────────────────────────────────
  private rebuild(): void {
    const s = this.store.snapshot();
    this.users = s.users.map(u => ({ id: u.id, label: `${u.firstName} ${u.lastName}` }));
    this.entretiens = s.entretiens;

    // Map entretiens → CalendarEvents
    this.allEvents = s.entretiens.map(e => {
      const dateStr = e.date;
      const d = new Date(dateStr);
      const partner = s.users.find(u => u.id === e.partenaireId);
      const recruiter = this.recruiters.find(r => r.id === (e as any).intervenantId) || this.recruiters[0];
      
      return {
        id: e.id,
        title: partner ? `${partner.firstName} ${partner.lastName}` : `#${e.id}`,
        date: d,
        hour: d.getHours() || 9,
        duration: (e as any).duree || 60,
        mode: e.mode,
        decision: e.decision,
        score: e.scoreGlobal,
        partenaireId: e.partenaireId,
        partenaireLabel: partner ? `${partner.firstName} ${partner.lastName}` : String(e.partenaireId),
        intervenantLabel: recruiter.label,
        color: this.MODE_COLORS[e.mode],
        workflowStep: e.workflowStep as WorkflowStep || 'screening',
      } as CalendarEvent;
    });

    // Detect conflicts
    this.detectConflicts();

    // Build views
    this.buildCalendar();
    this.buildWeekView();
    this.buildListRows(s.users);

    // Stats calculation
    this.totalEntretiens = s.entretiens.length;
    this.avgScore = s.entretiens.length
      ? Math.round(s.entretiens.reduce((a, e) => a + e.scoreGlobal, 0) / s.entretiens.length)
      : 0;
    this.noShowCount = s.entretiens.filter(e => e.decision === 'REFUSER').length;
    this.noShowRate = s.entretiens.length ? Math.round((this.noShowCount / s.entretiens.length) * 100) : 0;
    this.avgDuration = s.entretiens.length ? 45 : 0; // Simulated constant for mockup
    
    // Occupancy based on 40h/week
    this.occupancyRate = Math.min(100, Math.round((s.entretiens.length * 0.75 / 40) * 100));
  }



  // ── Calendar builders ─────────────────────────────────────
  buildCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    this.calendarDays = [];
    const today = new Date();

    for (let i = startPadding; i > 0; i--) {
      const d = new Date(year, month, 1 - i);
      this.calendarDays.push(this.makeDay(d, false, today));
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      this.calendarDays.push(this.makeDay(date, true, today));
    }
    const remaining = 42 - this.calendarDays.length;
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(year, month + 1, d);
      this.calendarDays.push(this.makeDay(date, false, today));
    }
  }

  buildWeekView(): void {
    const startOfWeek = new Date(this.currentDate);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    const today = new Date();
    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      this.weekDays.push(this.makeDay(d, true, today));
    }
  }

  private makeDay(date: Date, isCurrentMonth: boolean, today: Date): CalendarDay {
    return {
      date,
      isCurrentMonth,
      isToday: this.sameDay(date, today),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      events: this.allEvents.filter(e => this.sameDay(e.date, date)),
    };
  }

  buildTimeSlots(): void {
    this.timeSlots = [];
    for (let h = 8; h <= 18; h++) {
      for (const m of [0, 30]) {
        const label = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        this.timeSlots.push({ hour: h, minute: m, label, available: true });
      }
    }
  }

  // ── Conflict detection ────────────────────────────────────
  detectConflicts(): void {
    this.conflicts = [];
    for (let i = 0; i < this.allEvents.length; i++) {
      for (let j = i + 1; j < this.allEvents.length; j++) {
        const a = this.allEvents[i];
        const b = this.allEvents[j];
        if (this.sameDay(a.date, b.date) && a.partenaireId === b.partenaireId) {
          const aStart = a.hour * 60;
          const aEnd = aStart + a.duration;
          const bStart = b.hour * 60;
          const bEnd = bStart + b.duration;
          if (aStart < bEnd && bStart < aEnd) {
            this.conflicts.push({
              eventA: a, eventB: b,
              message: `⚠️ Conflict: ${a.partenaireLabel} has 2 overlapping interviews on ${this.formatDate(a.date)}`,
            });
            a.conflictDetected = true;
            b.conflictDetected = true;
          }
        }
      }
    }
  }

  // ── Suggested slots ───────────────────────────────────────
  suggestSlots(date: string): void {
    const selectedDate = new Date(date);
    const eventsOnDay = this.allEvents.filter(e => this.sameDay(e.date, selectedDate));
    const occupiedHours = new Set(eventsOnDay.map(e => e.hour));
    this.suggestedSlots = [];
    for (let h = 9; h <= 17; h++) {
      if (!occupiedHours.has(h)) {
        this.suggestedSlots.push(`${String(h).padStart(2, '0')}:00`);
        if (this.suggestedSlots.length >= 3) break;
      }
    }
  }

  applySlot(slot: string): void {
    this.form.patchValue({ heure: slot });
    this.showSlotPicker = false;
  }

  // ── Navigation ────────────────────────────────────────────
  prev(): void {
    if (this.activeView === 'month') {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    } else {
      this.currentDate = new Date(this.currentDate.getTime() - 7 * 86400000);
    }
    this.buildCalendar();
    this.buildWeekView();
  }

  next(): void {
    if (this.activeView === 'month') {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    } else {
      this.currentDate = new Date(this.currentDate.getTime() + 7 * 86400000);
    }
    this.buildCalendar();
    this.buildWeekView();
  }

  today(): void {
    this.currentDate = new Date();
    this.buildCalendar();
    this.buildWeekView();
  }

  get currentMonthLabel(): string {
    return this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  // ── List view ─────────────────────────────────────────────
  private buildListRows(partnerUsers: PartnerUser[]): void {
    let list = this.entretiens;
    if (this.filterPartnerId != null) list = list.filter(e => e.partenaireId === this.filterPartnerId);
    this.rows = list
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(e => ({
        ...e,
        partenaireLabel: partnerUsers.find(u => u.id === e.partenaireId)?.lastName || e.partenaireId,
        workflowStep: 'HR Interview',
      }));
  }

  applyFilter(): void {
    this.rebuild();
  }

  historiqueForPartner(pid: number | null): void {
    this.filterPartnerId = pid;
    this.applyFilter();
  }

  // ── CRUD ──────────────────────────────────────────────────
  openCreate(date?: Date): void {
    this.editingId = null;
    const d = date ?? new Date();
    const dateStr = d.toISOString().slice(0, 10);
    this.form.reset({
      partenaireId: null, date: dateStr, heure: '09:00', duree: 60,
      mode: 'VISIO', decision: 'VALIDER', scoreGlobal: 70,
      workflowStep: 'screening', notes: '',
    });
    this.suggestSlots(dateStr);
    this.showModal = true;
  }

  openEdit(row: Record<string, unknown>): void {
    const e = this.store.snapshot().entretiens.find(x => x.id === row['id']);
    if (!e) return;
    this.editingId = e.id;
    const d = new Date(e.date);
    this.form.patchValue({
      ...e,
      date: e.date.slice(0, 10),
      heure: `${String(d.getHours() || 9).padStart(2, '0')}:00`,
      duree: 60, workflowStep: 'rh', notes: '',
    });
    this.showModal = true;
  }

  invalidField(name: string): boolean { return showFieldError(this.form.get(name)); }
  messageField(name: string): string {
    const c = this.form.get(name);
    return c?.errors ? validationMessage(c.errors) : '';
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Please correct the errors.');
      return;
    }
    const v = this.form.getRawValue();
    const [hh, mm] = (v.heure || '09:00').split(':');
    const dateWithTime = `${v.date}T${hh.padStart(2, '0')}:${mm || '00'}:00`;
    const payload = {
      partenaireId: Number(v.partenaireId),
      date: dateWithTime,
      mode: v.mode as EntretienMode,
      decision: v.decision as EntretienDecision,
      scoreGlobal: Number(v.scoreGlobal),
      workflowStep: v.workflowStep,
      intervenantId: Number(v.intervenantId),
      duree: Number(v.duree),
      notes: v.notes,
    };
    if (this.editingId != null) {
      this.store.updateEntretien(this.editingId, payload);
      this.toast.success('Interview updated');
    } else {
      this.store.addEntretien(payload);
      this.toast.success('Interview scheduled');
    }
    this.showModal = false;
  }

  remove(row: Record<string, unknown>): void {
    if (confirm('Delete this interview?')) {
      this.store.deleteEntretien(row['id'] as number);
      this.toast.success('Interview deleted');
    }
  }

  removeEvent(event: CalendarEvent): void {
    if (confirm('Delete this interview?')) {
      this.store.deleteEntretien(event.id);
      this.toast.success('Interview deleted');
    }
  }

  // ── Helpers ───────────────────────────────────────────────
  sameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  formatDate(d: Date): string {
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getEventTop(event: CalendarEvent): number {
    return ((event.hour - 8) * 60 + (event.date.getMinutes() || 0)) * (60 / 60);
  }

  getWeekEventsForHour(day: CalendarDay, hour: number): CalendarEvent[] {
    return day.events.filter(e => e.hour === hour);
  }
}