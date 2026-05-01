import { Component, OnInit } from '@angular/core';
import { AdminDashboardService } from '../../../../shared/services/admin-dashboard.service';
import { TransportStatsResponse } from '../../../../shared/models/transport-stats.model';

@Component({
  selector: 'app-transport-page',
  templateUrl: './transport-page.component.html',
  styleUrls: ['./transport-page.component.css']
})
export class TransportPageComponent implements OnInit {

  stats?: TransportStatsResponse;
  loadingStats = false;
  statsError = '';

  constructor(private adminDashboardService: AdminDashboardService) {}

  ngOnInit(): void {
    this.loadTransportStats();
  }

  loadTransportStats(): void {
    this.loadingStats = true;
    this.statsError = '';

    this.adminDashboardService.getTransportStats().subscribe({
      next: (data: TransportStatsResponse) => {
        this.stats = data;
        this.loadingStats = false;
      },
      error: () => {
        this.statsError = 'Erreur lors du chargement des statistiques.';
        this.loadingStats = false;
      }
    });
  }
}