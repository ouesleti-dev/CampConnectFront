import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { Subscription } from 'rxjs';
import { PartnershipState } from '../../models/partnership.models';
import { PartnershipStoreService } from '../../services/partnership-store.service';

@Component({
  selector: 'app-pa-stats-page',
  templateUrl: './pa-stats-page.component.html',
})
export class PaStatsPageComponent implements OnInit, OnDestroy {
  barScores?: ChartConfiguration;
  lineQuiz?: ChartConfiguration;
  pieDecisions?: ChartConfiguration;

  private sub?: Subscription;

  constructor(private store: PartnershipStoreService) {}

  ngOnInit(): void {
    this.sub = this.store.observe().subscribe((s) => this.rebuild(s));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private rebuild(s: PartnershipState): void {
    this.barScores = {
      type: 'bar',
      data: {
        labels: s.users.map((u) => u.lastName),
        datasets: [{ label: 'Score partenaire', data: s.users.map((u) => u.score), backgroundColor: '#0dcaf0' }],
      },
      options: { plugins: { legend: { display: false } }, maintainAspectRatio: false },
    };

    const byMonth = new Map<string, { sum: number; n: number }>();
    for (const r of s.reponses) {
      const q = s.questions.find((x) => x.id === r.questionId);
      const month = q ? `Q${q.quizId}` : '—';
      const cur = byMonth.get(month) || { sum: 0, n: 0 };
      cur.sum += r.score;
      cur.n += 1;
      byMonth.set(month, cur);
    }
    const keys = [...byMonth.keys()];
    this.lineQuiz = {
      type: 'line',
      data: {
        labels: keys,
        datasets: [
          {
            label: 'Moyenne score réponses',
            data: keys.map((k) => {
              const x = byMonth.get(k)!;
              return Math.round((x.sum / x.n) * 10) / 10;
            }),
            borderColor: '#0d6efd',
            tension: 0.3,
            fill: true,
            backgroundColor: 'rgba(13,110,253,0.08)',
          },
        ],
      },
      options: { plugins: { legend: { display: true } }, maintainAspectRatio: false },
    };

    const dec = ['VALIDER', 'REFUSER', 'A_AMELIORER'] as const;
    this.pieDecisions = {
      type: 'pie',
      data: {
        labels: [...dec],
        datasets: [
          {
            data: dec.map((d) => s.entretiens.filter((e) => e.decision === d).length),
            backgroundColor: ['#198754', '#dc3545', '#ffc107'],
          },
        ],
      },
      options: { plugins: { legend: { position: 'bottom' } }, maintainAspectRatio: false },
    };
  }
}
