import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { Subscription } from 'rxjs';
import { PartnershipState } from '../../models/partnership.models';
import { PartnershipStoreService } from '../../services/partnership-store.service';

@Component({
  selector: 'app-pa-dashboard-page',
  templateUrl: './pa-dashboard-page.component.html',
})
export class PaDashboardPageComponent implements OnInit, OnDestroy {
  stats = { offres: 0, contratsActifs: 0, scoreMoyen: 0 };
  doughnutOffres?: ChartConfiguration;
  lineScores?: ChartConfiguration;
  barContrats?: ChartConfiguration;

  private sub?: Subscription;

  constructor(private store: PartnershipStoreService) {}

  ngOnInit(): void {
    this.sub = this.store.observe().subscribe((s) => this.rebuild(s));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private rebuild(s: PartnershipState): void {
    this.stats = {
      offres: s.offres.length,
      contratsActifs: s.contrats.filter((c) => c.statut === 'EN_COURS').length,
      scoreMoyen: s.users.length
        ? Math.round(s.users.reduce((a, u) => a + (u.score || 0), 0) / s.users.length)
        : 0,
    };

    const statuts = ['PROPOSEE', 'ACCEPTEE', 'REFUSEE', 'EXPIREE'] as const;
    const counts = statuts.map((st) => s.offres.filter((o) => o.statut === st).length);
    this.doughnutOffres = {
      type: 'doughnut',
      data: {
        labels: [...statuts],
        datasets: [
          {
            data: counts,
            backgroundColor: ['#6ea8fe', '#0d6efd', '#dc3545', '#adb5bd'],
          },
        ],
      },
      options: { plugins: { legend: { position: 'bottom' } }, maintainAspectRatio: false },
    };

    const byMonthScore = this.avgByMonth(
      s.entretiens.map((e) => ({ d: e.date, v: e.scoreGlobal })),
    );
    this.lineScores = {
      type: 'line',
      data: {
        labels: byMonthScore.labels,
        datasets: [
          {
            label: 'Score moyen (entretiens)',
            data: byMonthScore.values,
            borderColor: '#0d6efd',
            backgroundColor: 'rgba(13,110,253,0.1)',
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: { plugins: { legend: { display: true } }, maintainAspectRatio: false },
    };

    const byMonthContrats = this.countByMonth(s.contrats.map((c) => c.dateDebut));
    this.barContrats = {
      type: 'bar',
      data: {
        labels: byMonthContrats.labels,
        datasets: [
          {
            label: 'Contrats',
            data: byMonthContrats.values,
            backgroundColor: '#86b7fe',
          },
        ],
      },
      options: { plugins: { legend: { display: false } }, maintainAspectRatio: false },
    };
  }

  private avgByMonth(items: { d: string; v: number }[]): { labels: string[]; values: number[] } {
    const map = new Map<string, { sum: number; n: number }>();
    for (const { d, v } of items) {
      const key = d.slice(0, 7);
      const cur = map.get(key) || { sum: 0, n: 0 };
      cur.sum += v;
      cur.n += 1;
      map.set(key, cur);
    }
    const keys = [...map.keys()].sort();
    return {
      labels: keys,
      values: keys.map((k) => Math.round((map.get(k)!.sum / map.get(k)!.n) * 10) / 10),
    };
  }

  private countByMonth(dates: string[]): { labels: string[]; values: number[] } {
    const map = new Map<string, number>();
    for (const d of dates) {
      const key = d.slice(0, 7);
      map.set(key, (map.get(key) || 0) + 1);
    }
    const keys = [...map.keys()].sort();
    return { labels: keys, values: keys.map((k) => map.get(k) || 0) };
  }
}
