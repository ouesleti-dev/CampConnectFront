// analytics-dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DemandService } from '../../../../shared/services/demand.service';
import { DemandDecision } from '../../../../shared/models/demand.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-analyticsdashboard',
  templateUrl: './analyticsdashboard.component.html',
  styleUrls: ['./analyticsdashboard.component.css']
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {

  decisions: DemandDecision[] = [];
  selected: DemandDecision | null = null;
  isLoading = false;
  today = new Date();
  private chart: Chart | null = null;

  constructor(private demandService: DemandService) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  loadData(): void {
    this.isLoading = true;
    this.demandService.getAllDecisions().subscribe({
      next: (data) => {
        this.decisions = data;
        this.isLoading = false;
        if (data.length > 0) {
          this.selectDecision(data[0]);
        }
      },
      error: (err) => {
        console.error('Failed to load demand decisions', err);
        this.isLoading = false;
      }
    });
  }

  selectDecision(d: DemandDecision): void {
    this.selected = d;
    setTimeout(() => this.renderChart(d), 100);
  }

  renderChart(d: DemandDecision): void {
    this.chart?.destroy();

    const ctx = document.getElementById('demandChart') as HTMLCanvasElement;
    if (!ctx) return;

    const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
    const currentData    = this.distributeAcrossDays(d.currentRentals, 7);
    const previousData   = this.distributeAcrossDays(d.previousRentals, 7);
    const predictionData = currentData.map(v => Math.max(0, Math.round(v * (1 + d.trend))));

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: days,
        datasets: [
          {
            label: 'Current Rentals',
            data: currentData,
            borderColor: '#2563EB',
            backgroundColor: 'rgba(37,99,235,0.08)',
            borderWidth: 2.5,
            pointBackgroundColor: '#2563EB',
            pointRadius: 5,
            tension: 0.4,
            fill: true
          },
          {
            label: 'Previous Rentals',
            data: previousData,
            borderColor: '#9ca3af',
            backgroundColor: 'rgba(156,163,175,0.05)',
            borderWidth: 2,
            pointBackgroundColor: '#9ca3af',
            pointRadius: 4,
            tension: 0.4,
            fill: false,
            borderDash: [4, 4]
          },
          {
            label: 'Predicted',
            data: predictionData,
            borderColor: '#16a34a',
            backgroundColor: 'rgba(22,163,74,0.06)',
            borderWidth: 2,
            pointBackgroundColor: '#16a34a',
            pointRadius: 4,
            tension: 0.4,
            fill: false,
            borderDash: [6, 3]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#f1f5f9',
            bodyColor: '#cbd5e1',
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { color: '#64748b', font: { size: 12 } }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { color: '#64748b', font: { size: 12 }, stepSize: 1 }
          }
        }
      }
    });
  }

  distributeAcrossDays(total: number, days: number): number[] {
    if (total === 0) return Array(days).fill(0);
    const base = Math.floor(total / days);
    const remainder = total - base * days;
    return Array.from({ length: days }, (_, i) => base + (i < remainder ? 1 : 0));
  }

  // ─── Helpers ───────────────────────────────────────────────────

  getRentalBarWidth(): string {
    return Math.min((this.selected!.currentRentals / 10) * 100, 100) + '%';
  }

  getTrendBarWidth(): string {
    return Math.min(Math.abs(this.selected!.trend) * 100, 100) + '%';
  }

  getTrendBarClass(): string {
    return this.selected!.trend >= 0 ? 'green' : 'red';
  }

  getPredictionClass(p: string): string {
    const map: Record<string, string> = { GROWING: 'growing', DECLINING: 'declining', STABLE: 'stable' };
    return map[p] || '';
  }

  getPredictionIconClass(p: string): string {
    const map: Record<string, string> = { GROWING: 'green', DECLINING: 'red', STABLE: 'blue' };
    return map[p] || 'blue';
  }

  getPredictionIcon(p: string): string {
    const map: Record<string, string> = { GROWING: '🚀', DECLINING: '📉', STABLE: '⚖️' };
    return map[p] || '📊';
  }

  getActionClass(a: string): string {
    const map: Record<string, string> = {
      INCREASE_PRICE: 'action-increase',
      SLIGHT_INCREASE: 'action-slight',
      DECREASE_PRICE: 'action-decrease',
      KEEP_PRICE: 'action-keep'
    };
    return map[a] || '';
  }

  getActionIconClass(a: string): string {
    const map: Record<string, string> = {
      INCREASE_PRICE: 'green', SLIGHT_INCREASE: 'blue',
      DECREASE_PRICE: 'red',   KEEP_PRICE: 'gray'
    };
    return map[a] || 'gray';
  }

  getActionIcon(a: string): string {
    const map: Record<string, string> = {
      INCREASE_PRICE: '💹', SLIGHT_INCREASE: '📈',
      DECREASE_PRICE: '📉', KEEP_PRICE: '⚖️'
    };
    return map[a] || '💰';
  }

  getActionLabel(a: string): string {
    const map: Record<string, string> = {
      INCREASE_PRICE: '+15%', SLIGHT_INCREASE: '+5%',
      DECREASE_PRICE: '-10%', KEEP_PRICE: '0%'
    };
    return map[a] || a;
  }
}