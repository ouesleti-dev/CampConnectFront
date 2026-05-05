import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { Subscription } from 'rxjs';
import { PartnershipState } from '../../models/partnership.models';
import { PartnershipStoreService } from '../../services/partnership-store.service';

@Component({
  selector: 'app-pa-dashboard-page',
  templateUrl: './pa-dashboard-page.component.html',
  styleUrl: './pa-dashboard-page.component.css',
})
export class PaDashboardPageComponent implements OnInit, OnDestroy {
  stats = { offres: 0, contratsActifs: 0, scoreMoyen: 0, pendingQuiz: 0 };
  doughnutOffres?: ChartConfiguration;
  lineScores?: ChartConfiguration;
  barContrats?: ChartConfiguration;

  recentActivity: any[] = [];
  upcomingEvents: any[] = [];

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
      pendingQuiz: s.reponses.length
    };

    // Activity Feed (Recent users/contracts/interviews)
    this.recentActivity = [
      ...s.users.slice(-2).map(u => ({ type: 'USER', label: `${u.firstName} ${u.lastName}`, date: new Date(), icon: '👥' })),
      ...s.entretiens.slice(-2).map(e => ({ type: 'INT', label: `Interview #${e.id}`, date: new Date(e.date), icon: '📅' }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

    // Upcoming events
    this.upcomingEvents = s.entretiens
      .filter(e => new Date(e.date) >= new Date())
      .slice(0, 3)
      .map(e => {
        const partner = s.users.find(u => u.id === e.partenaireId);
        return {
          id: e.id,
          title: partner ? `${partner.firstName} ${partner.lastName}` : 'Partner',
          time: e.date,
          mode: e.mode
        };
      });

    const statuts = ['PROPOSEE', 'ACCEPTEE', 'REFUSEE', 'EXPIREE'] as const;
    const counts = statuts.map((st) => s.offres.filter((o) => o.statut === st).length);
    this.doughnutOffres = {
      type: 'doughnut',
      data: {
        labels: [...statuts],
        datasets: [{
          data: counts,
          backgroundColor: ['#3b82f6', '#10b981', '#ef4444', '#94a3b8'],
          borderWidth: 0,
          hoverOffset: 10
        }],
      },
      options: { 
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } }, 
        maintainAspectRatio: false,
        cutout: '75%'
      } as any,
    };

    const byMonthScore = this.avgByMonth(s.entretiens.map((e) => ({ d: e.date, v: e.scoreGlobal })));
    this.lineScores = {
      type: 'line',
      data: {
        labels: byMonthScore.labels,
        datasets: [{
          label: 'Average Performance',
          data: byMonthScore.values,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.05)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#10b981',
          borderWidth: 3
        }],
      },
      options: { 
        plugins: { legend: { display: false } }, 
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, max: 100, grid: { color: '#f1f5f9' } },
          x: { grid: { display: false } }
        }
      },
    };

    const byMonthContrats = this.countByMonth(s.contrats.map((c) => c.dateDebut));
    this.barContrats = {
      type: 'bar',
      data: {
        labels: byMonthContrats.labels,
        datasets: [{
          label: 'New Contracts',
          data: byMonthContrats.values,
          backgroundColor: '#3b82f6',
          borderRadius: 8,
          barThickness: 25
        }],
      },
      options: { 
        plugins: { legend: { display: false } }, 
        maintainAspectRatio: false,
        scales: {
          y: { grid: { color: '#f1f5f9' } },
          x: { grid: { display: false } }
        }
      },
    };
  }

  private avgByMonth(items: { d: string; v: number }[]): { labels: string[]; values: number[] } {
    const map = new Map<string, { sum: number; n: number }>();
    for (const { d, v } of items) {
      const key = d.slice(0, 7);
      const cur = map.get(key) || { sum: 0, n: 0 };
      cur.sum += v; cur.n += 1;
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
