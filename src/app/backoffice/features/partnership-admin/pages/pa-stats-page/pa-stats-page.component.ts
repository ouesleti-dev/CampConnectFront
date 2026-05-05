import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { Subscription } from 'rxjs';
import { PartnershipState } from '../../models/partnership.models';
import { PartnershipStoreService } from '../../services/partnership-store.service';
import { ScoringEngineService } from '../../services/scoring-engine.service';
import { ScoringResult, ScoringCriterion, ScoringConfig } from '../../services/scoring-engine.types';

@Component({
  selector: 'app-pa-stats-page',
  templateUrl: './pa-stats-page.component.html',
  styleUrls: ['./pa-stats-page.component.css'],
})
export class PaStatsPageComponent implements OnInit, OnDestroy {
  // ── Charts ──────────────────────────────────────────────────
  barScores?: ChartConfiguration;
  lineQuiz?: ChartConfiguration;
  pieDecisions?: ChartConfiguration;
  radarChart?: ChartConfiguration;

  // ── Scoring Engine ──────────────────────────────────────────
  scoringConfig!: ScoringConfig;
  demoResult?: ScoringResult;

  // Valeurs demo saisies par l'utilisateur
  demoInputs: Record<string, number> = {
    quiz: 75,
    entretien: 62,
    coherence: 80,
    communication: 55,
  };

  activeTab: 'stats' | 'scoring' | 'config' = 'stats';

  private sub?: Subscription;

  constructor(
    private store: PartnershipStoreService,
    public engine: ScoringEngineService,
  ) {}

  ngOnInit(): void {
    this.scoringConfig = this.engine.getConfig();
    this.runDemo();
    this.sub = this.store.observe().subscribe((s) => this.rebuild(s));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // ── Scoring Engine Methods ───────────────────────────────────
  runDemo(): void {
    this.demoResult = this.engine.compute(this.demoInputs);
    this.buildRadarChart();
  }

  updateWeight(criterion: ScoringCriterion, event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    criterion.weight = Math.round(val) / 100;
    this.runDemo();
  }

  toggleCriterion(criterion: ScoringCriterion): void {
    criterion.enabled = !criterion.enabled;
    this.engine.toggleCriterion(criterion.id, criterion.enabled);
    this.runDemo();
  }

  getLevelColor(level: string | undefined): string {
    if (!level) return '#6b7280';
    const t = this.scoringConfig.thresholds.find(x => x.level === level);
    return t?.color ?? '#6b7280';
  }

  getScoreColor(score: number): string {
    if (score >= 75) return '#10b981';
    if (score >= 50) return '#3b82f6';
    if (score >= 30) return '#f59e0b';
    return '#ef4444';
  }

  getCriterionContribution(id: string): number {
    return this.demoResult?.weightedContributions[id] ?? 0;
  }

  get sortedCriteria(): ScoringCriterion[] {
    return [...this.scoringConfig.criteria].sort((a, b) => b.weight - a.weight);
  }

  // ── Charts ──────────────────────────────────────────────────
  private buildRadarChart(): void {
    if (!this.demoResult) return;
    const labels = this.scoringConfig.criteria.filter(c => c.enabled).map(c => c.label);
    const data = this.scoringConfig.criteria.filter(c => c.enabled).map(c => this.demoResult!.subScores[c.id] ?? 0);
    this.radarChart = {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: 'Candidate profile',
          data,
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          borderColor: '#10b981',
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#fff',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { r: { min: 0, max: 100, ticks: { stepSize: 25 } } },
        plugins: { legend: { display: false } },
      },
    };
  }

  private rebuild(s: PartnershipState): void {
    // Bar chart des scores partenaires
    this.barScores = {
      type: 'bar',
      data: {
        labels: s.users.map((u) => u.lastName),
        datasets: [{
          label: 'Partner score',
          data: s.users.map((u) => u.score),
          backgroundColor: '#10b981',
          borderRadius: 8,
        }],
      },
      options: {
        plugins: { legend: { display: false } },
        maintainAspectRatio: false,
        scales: { y: { min: 0, max: 100 } },
      },
    };

    // Line chart quiz
    const byQuiz = new Map<string, { sum: number; n: number }>();
    for (const r of s.reponses) {
      const q = s.questions.find((x) => x.id === r.questionId);
      const key = q ? `Quiz ${q.quizId}` : '—';
      const cur = byQuiz.get(key) || { sum: 0, n: 0 };
      cur.sum += r.score;
      cur.n += 1;
      byQuiz.set(key, cur);
    }
    const keys = [...byQuiz.keys()];
    this.lineQuiz = {
      type: 'line',
      data: {
        labels: keys,
        datasets: [{
          label: 'Average quiz score',
          data: keys.map((k) => {
            const x = byQuiz.get(k)!;
            return Math.round((x.sum / x.n) * 10) / 10;
          }),
          borderColor: '#3b82f6',
          tension: 0.4,
          fill: true,
          backgroundColor: 'rgba(59,130,246,0.08)',
        }],
      },
      options: { plugins: { legend: { display: true } }, maintainAspectRatio: false },
    };

    // Pie decisions interviews
    const dec = ['VALIDER', 'REFUSER', 'A_AMELIORER'] as const;
    this.pieDecisions = {
      type: 'doughnut',
      data: {
        labels: ['Validated', 'Refused', 'To improve'],
        datasets: [{
          data: dec.map((d) => s.entretiens.filter((e) => e.decision === d).length),
          backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
          borderWidth: 0,
        }],
      },
      options: { plugins: { legend: { position: 'bottom' } }, maintainAspectRatio: false, cutout: '65%' } as any,
    };
  }
}
