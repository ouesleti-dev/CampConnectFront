import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

type DemandLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

interface TopDestination {
  destination: string;
  tripCount: number;
}

interface DemandAnalysisResponse {
  totalReservations: number;
  totalTrips: number;
  averageOccupancyRate: number;
  reservationsByHour: Record<string, number>;
  peakHour: string;
  lowHour: string;
  reservationsByDayOfWeek: Record<string, number>;
  peakDay: string;
  topDestinations: TopDestination[];
  currentDemandLevel: DemandLevel;
  demandAdvice: string;
  demandScore: number;
}

@Component({
  selector: 'app-demand-analysis',
  templateUrl: './demand-analysis.component.html',
  styleUrls: ['./demand-analysis.component.css']
})
export class DemandAnalysisComponent implements OnInit {
  globalData: DemandAnalysisResponse | null = null;
  destinationData: DemandAnalysisResponse | null = null;

  isLoading = false;
  error = '';
  searchDestination = '';
  showSearchResults = false;

  private readonly apiUrl = 'http://localhost:8088/campConnect/demand-analysis';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadGlobalDemand();
  }

  loadGlobalDemand(): void {
    this.isLoading = true;
    this.error = '';

    this.http.get<DemandAnalysisResponse>(`${this.apiUrl}/global`).subscribe({
      next: (data: DemandAnalysisResponse) => {
        this.globalData = data;
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Demand analysis error:', err);
        this.error = err.error?.message || 'Failed to load global demand data';
        this.isLoading = false;
      }
    });
  }

  searchByDestination(): void {
    const destination = this.searchDestination.trim();

    if (!destination) {
      this.error = 'Please enter a destination';
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.destinationData = null;
    this.showSearchResults = false;

    const encodedDestination = encodeURIComponent(destination);

    this.http.get<DemandAnalysisResponse>(
      `${this.apiUrl}/destination/${encodedDestination}`
    ).subscribe({
      next: (data: DemandAnalysisResponse) => {
        this.destinationData = data;
        this.showSearchResults = true;
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Destination demand error:', err);
        this.error = err.error?.message || 'Destination not found or no data available';
        this.showSearchResults = false;
        this.isLoading = false;
      }
    });
  }

  getDemandColor(level: DemandLevel | string | undefined): string {
    switch (level) {
      case 'VERY_HIGH':
        return '#ef4444';
      case 'HIGH':
        return '#f59e0b';
      case 'MEDIUM':
        return '#3b82f6';
      case 'LOW':
        return '#10b981';
      default:
        return '#6b7280';
    }
  }

  getDemandIcon(level: DemandLevel | string | undefined): string {
    switch (level) {
      case 'VERY_HIGH':
        return '🚀';
      case 'HIGH':
        return '📈';
      case 'MEDIUM':
        return '📊';
      case 'LOW':
        return '📉';
      default:
        return '📋';
    }
  }

  getDemandLabel(level: DemandLevel | string | undefined): string {
    switch (level) {
      case 'VERY_HIGH':
        return 'Very High Demand';
      case 'HIGH':
        return 'High Demand';
      case 'MEDIUM':
        return 'Medium Demand';
      case 'LOW':
        return 'Low Demand';
      default:
        return 'Unknown';
    }
  }

  getBarWidth(value: number, max: number): number {
    if (!max || max <= 0) {
      return 0;
    }

    return Math.min((value / max) * 100, 100);
  }

  getMaxDestinationCount(data: DemandAnalysisResponse | null): number {
    if (!data || !data.topDestinations || data.topDestinations.length === 0) {
      return 0;
    }

    return Math.max(...data.topDestinations.map(item => item.tripCount));
  }

  goBack(): void {
    this.router.navigate(['/transport']);
  }

  clearSearch(): void {
    this.searchDestination = '';
    this.destinationData = null;
    this.showSearchResults = false;
    this.error = '';
  }
}