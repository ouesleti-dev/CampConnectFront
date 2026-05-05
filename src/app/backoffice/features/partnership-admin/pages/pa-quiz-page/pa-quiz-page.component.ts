import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { optionalJsonArrayValidator, showFieldError, validationMessage } from '../../shared/form-validation';
import { ChartConfiguration } from 'chart.js';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { QuestionType } from '../../models/partnership.models';
import { PartnershipStoreService } from '../../services/partnership-store.service';

@Component({
  selector: 'app-pa-quiz-page',
  templateUrl: './pa-quiz-page.component.html',
})
export class PaQuizPageComponent implements OnInit, OnDestroy {

  // ── View State ────────────────────────────────────────────
  activeTab: 'quizzes' | 'questions' | 'results' = 'quizzes';
  
  quizRows: Record<string, unknown>[] = [];
  questionRows: Record<string, unknown>[] = [];
  reponseRows: Record<string, unknown>[] = [];
  
  qCols = [{ key: 'id', label: 'ID' }, { key: 'titre', label: 'Title' }, { key: 'partenaireLabel', label: 'Partner' }];
  quCols = [{ key: 'id', label: 'ID' }, { key: 'quizLabel', label: 'Quiz' }, { key: 'texte', label: 'Question' }, { key: 'type', label: 'Type' }, { key: 'points', label: 'Pts' }];
  rCols = [{ key: 'id', label: 'ID' }, { key: 'questionLabel', label: 'Question' }, { key: 'partenaireLabel', label: 'Partner' }, { key: 'valeur', label: 'Answer' }, { key: 'score', label: 'Score' }];

  // ── Stats ─────────────────────────────────────────────────
  totalQuizzes = 0;
  totalQuestions = 0;
  avgCompletionRate = 85; // Simulated for UI
  globalAvgScore = 0;

  users: { id: number; label: string }[] = [];
  quizzes: { id: number; label: string }[] = [];
  questions: { id: number; label: string }[] = [];
  types: QuestionType[] = ['QCM', 'OUVERTE', 'NOTE', 'OUI_NON'];

  chartByPartner?: ChartConfiguration;
  chartByQuiz?: ChartConfiguration;

  showQuiz = false;
  showQuestion = false;
  showReponse = false;
  editingQuiz: number | null = null;
  editingQuestion: number | null = null;

  quizForm!: FormGroup;
  questionForm!: FormGroup;
  reponseForm!: FormGroup;

  private sub?: Subscription;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: PartnershipStoreService,
    private readonly toast: ToastrService,
  ) {
    this.quizForm = this.fb.group({
      titre:       ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      partenaireId:[null as number | null, Validators.required],
    });

    this.questionForm = this.fb.group({
      quizId:      [null as number | null, Validators.required],
      texte:       ['', [Validators.required, Validators.minLength(3), Validators.maxLength(2000)]],
      type:        ['OUI_NON' as QuestionType, Validators.required],
      points:      [10, [Validators.required, Validators.min(1), Validators.max(1000)]],
      optionsJson: ['', optionalJsonArrayValidator],
      bonneReponse:['', Validators.maxLength(500)],
    });

    this.reponseForm = this.fb.group({
      questionId:  [null as number | null, Validators.required],
      partenaireId:[null as number | null, Validators.required],
      valeur:      ['', [Validators.required, Validators.minLength(1), Validators.maxLength(2000)]],
    });
  }

  ngOnInit(): void {
    this.sub = this.store.observe().subscribe(() => this.rebuild());
    this.questionForm.get('type')?.valueChanges.subscribe(() => this.syncQuestionOptionsValidators());
    this.syncQuestionOptionsValidators();
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  private syncQuestionOptionsValidators(): void {
    const t = this.questionForm.get('type')?.value;
    const oj = this.questionForm.get('optionsJson');
    oj?.clearValidators();
    if (t === 'QCM') oj?.setValidators([Validators.required, optionalJsonArrayValidator]);
    else oj?.setValidators([optionalJsonArrayValidator]);
    oj?.updateValueAndValidity({ emitEvent: false });
  }

  qzInvalid(name: string): boolean { return showFieldError(this.quizForm.get(name)); }
  qzMsg(name: string): string { const c = this.quizForm.get(name); return c?.errors ? validationMessage(c.errors) : ''; }
  qnInvalid(name: string): boolean { return showFieldError(this.questionForm.get(name)); }
  qnMsg(name: string): string { const c = this.questionForm.get(name); return c?.errors ? validationMessage(c.errors) : ''; }
  rpInvalid(name: string): boolean { return showFieldError(this.reponseForm.get(name)); }
  rpMsg(name: string): string { const c = this.reponseForm.get(name); return c?.errors ? validationMessage(c.errors) : ''; }

  private rebuild(): void {
    const s = this.store.snapshot();
    this.users = s.users.map((u) => ({ id: u.id, label: `${u.firstName} ${u.lastName}` }));
    this.quizzes = s.quizzes.map((q) => ({ id: q.id, label: q.titre }));
    this.questions = s.questions.map((q) => ({ id: q.id, label: q.texte.slice(0, 40) }));
    
    this.quizRows = s.quizzes.map((q) => ({ 
      ...q, 
      partenaireLabel: s.users.find((u) => u.id === q.partenaireId)?.lastName || q.partenaireId 
    }));
    
    this.questionRows = s.questions.map((q) => ({ 
      ...q, 
      quizLabel: s.quizzes.find((z) => z.id === q.quizId)?.titre || q.quizId 
    }));
    
    this.reponseRows = s.reponses.map((r) => ({
      ...r,
      questionLabel: s.questions.find((q) => q.id === r.questionId)?.texte?.slice(0, 30) || r.questionId,
      partenaireLabel: s.users.find((u) => u.id === r.partenaireId)?.lastName || r.partenaireId,
    }));

    // Enhanced Stats
    this.totalQuizzes = s.quizzes.length;
    this.totalQuestions = s.questions.length;
    this.globalAvgScore = s.reponses.length 
      ? Math.round(s.reponses.reduce((acc, r) => acc + r.score, 0) / s.reponses.length) 
      : 0;

    // Charts
    const byPartner = new Map<number, number>();
    for (const r of s.reponses) byPartner.set(r.partenaireId, (byPartner.get(r.partenaireId) || 0) + r.score);
    const plabels = [...byPartner.keys()].map((id) => s.users.find((u) => u.id === id)?.lastName || String(id));
    
    this.chartByPartner = { 
      type: 'bar', 
      data: { 
        labels: plabels, 
        datasets: [{ 
          label: 'Total Score', 
          data: [...byPartner.values()], 
          backgroundColor: '#10b981',
          borderRadius: 6
        }] 
      }, 
      options: { plugins: { legend: { display: false } }, maintainAspectRatio: false } 
    };

    const byQuiz = new Map<number, number>();
    for (const r of s.reponses) { 
      const q = s.questions.find((x) => x.id === r.questionId); 
      if (q) byQuiz.set(q.quizId, (byQuiz.get(q.quizId) || 0) + r.score); 
    }
    const qlabels = [...byQuiz.keys()].map((id) => s.quizzes.find((z) => z.id === id)?.titre || String(id));
    
    this.chartByQuiz = { 
      type: 'doughnut', 
      data: { 
        labels: qlabels, 
        datasets: [{ 
          data: [...byQuiz.values()], 
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
          borderWidth: 0
        }] 
      }, 
      options: { 
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } }, 
        maintainAspectRatio: false,
        cutout: '70%'
      } as any 
    };
  }

  openQuiz(create: boolean, row?: Record<string, unknown>): void {
    this.editingQuiz = create ? null : (row!['id'] as number);
    if (create) this.quizForm.reset({ titre: '', partenaireId: null });
    else { const q = this.store.snapshot().quizzes.find((x) => x.id === row!['id']); this.quizForm.patchValue({ titre: q!.titre, partenaireId: q!.partenaireId }); }
    this.showQuiz = true;
    this.quizForm.markAsUntouched();
  }

  saveQuiz(): void {
    if (this.quizForm.invalid) { this.quizForm.markAllAsTouched(); this.toast.warning('Please correct the errors.'); return; }
    const v = this.quizForm.getRawValue();
    if (this.editingQuiz != null) { this.store.updateQuiz(this.editingQuiz, { titre: v.titre!, partenaireId: Number(v.partenaireId) }); this.toast.success('Quiz updated'); }
    else { this.store.addQuiz({ titre: v.titre!, partenaireId: Number(v.partenaireId) }); this.toast.success('Quiz created'); }
    this.showQuiz = false;
  }

  delQuiz(row: Record<string, unknown>): void {
    if (confirm('Delete this quiz and its questions?')) { this.store.deleteQuiz(row['id'] as number); this.toast.success('Quiz deleted'); }
  }

  openQuestion(create: boolean, row?: Record<string, unknown>): void {
    this.editingQuestion = create ? null : (row!['id'] as number);
    if (create) this.questionForm.reset({ quizId: null, texte: '', type: 'OUI_NON', points: 10, optionsJson: '', bonneReponse: '' });
    else {
      const q = this.store.snapshot().questions.find((x) => x.id === row!['id']);
      this.questionForm.patchValue({ quizId: q!.quizId, texte: q!.texte, type: q!.type, points: q!.points, optionsJson: q!.optionsJson || '', bonneReponse: q!.bonneReponse || '' });
    }
    this.syncQuestionOptionsValidators();
    this.showQuestion = true;
    this.questionForm.markAsUntouched();
  }

  saveQuestion(): void {
    if (this.questionForm.invalid) { this.questionForm.markAllAsTouched(); this.toast.warning('Please correct the errors.'); return; }
    const v = this.questionForm.getRawValue();
    const payload = { quizId: Number(v.quizId), texte: v.texte!, type: v.type as QuestionType, points: Number(v.points), optionsJson: v.optionsJson?.trim() || undefined, bonneReponse: v.bonneReponse?.trim() || undefined };
    if (this.editingQuestion != null) { this.store.updateQuestion(this.editingQuestion, payload); this.toast.success('Question updated'); }
    else { this.store.addQuestion(payload); this.toast.success('Question added'); }
    this.showQuestion = false;
  }

  delQuestion(row: Record<string, unknown>): void {
    if (confirm('Delete this question?')) { this.store.deleteQuestion(row['id'] as number); this.toast.success('Question deleted'); }
  }

  openReponse(): void {
    this.reponseForm.reset({ questionId: null, partenaireId: null, valeur: '' });
    this.showReponse = true;
    this.reponseForm.markAsUntouched();
  }

  saveReponse(): void {
    if (this.reponseForm.invalid) { this.reponseForm.markAllAsTouched(); this.toast.warning('Please correct the errors.'); return; }
    const v = this.reponseForm.getRawValue();
    this.store.addReponse({ questionId: Number(v.questionId), partenaireId: Number(v.partenaireId), valeur: v.valeur! });
    this.toast.success('Answer saved (score calculated)');
    this.showReponse = false;
  }

  delReponse(row: Record<string, unknown>): void {
    if (confirm('Delete this answer?')) { this.store.deleteReponse(row['id'] as number); this.toast.success('Answer deleted'); }
  }

}