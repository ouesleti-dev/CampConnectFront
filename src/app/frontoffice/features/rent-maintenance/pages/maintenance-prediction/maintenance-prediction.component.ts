import { Component, OnInit } from '@angular/core';
import { MaintenanceService } from '../../../../shared/services/maintenance.service';
import { MaintenancePrediction } from '../../../../shared/models/maintenance-prediction.model';

@Component({
  selector: 'app-maintenance-prediction',
  templateUrl: './maintenance-prediction.component.html',
  styleUrls: ['./maintenance-prediction.component.css']
})
export class MaintenancePredictionComponent implements OnInit {

  predictions: MaintenancePrediction[] = [];
  loading = false;
  error = '';

  constructor(private maintenanceService: MaintenanceService) {}

  ngOnInit(): void {
    this.loadPredictions();
  }

  loadPredictions(): void {
    this.loading = true;
    this.error = '';
    this.maintenanceService.predictForCurrentUser().subscribe({
      next: (data) => {
        this.predictions = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load predictions. Please try again.';
        this.loading = false;
      }
    });
  }

  getRiskIcon(level: string): string {
    switch (level) {
      case 'HIGH':   return '🔴';
      case 'MEDIUM': return '🟠';
      case 'LOW':    return '🟢';
      default:       return '';
    }
  }

  getRiskDescription(level: string): string {
    switch (level) {
      case 'HIGH':   return 'Maintenance required immediately (score 70–100)';
      case 'MEDIUM': return 'Monitor equipment closely (score 40–70)';
      case 'LOW':    return 'No maintenance needed (score 0–40)';
      default:       return '';
    }
  }
}