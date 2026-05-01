import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  TripRecommendationRequest,
  TripRecommendationResponse
} from '../../../../shared/models/recommendation.model';
import { RecommendationService } from '../../../../shared/services/recommendation.service';

@Component({
  selector: 'app-recommendation',
  templateUrl: './recommendation.component.html',
  styleUrls: ['./recommendation.component.css']
})
export class RecommendationComponent implements OnInit {
  recommendationForm!: FormGroup;
  recommendations: TripRecommendationResponse[] = [];
  isLoading = false;
  hasSearched = false;
  errorMessage = '';

  readonly preferredTypes: string[] = ['Ride_sharing', 'Public_transport'];

  constructor(
    private fb: FormBuilder,
    private recommendationService: RecommendationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.recommendationForm = this.fb.group({
      departureLocation: ['', [Validators.required, Validators.minLength(2)]],
      destination: ['', [Validators.required, Validators.minLength(2)]],
      passengerCount: [1, [Validators.required, Validators.min(1)]],
      maxPrice: [0, [Validators.required, Validators.min(0)]],
      preferredType: ['Ride_sharing', Validators.required]
    });
  }

  onSearch(): void {
    if (this.recommendationForm.invalid) {
      this.recommendationForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.hasSearched = true;
    this.errorMessage = '';

    const request: TripRecommendationRequest = {
      departureLocation: this.recommendationForm.get('departureLocation')?.value as string,
      destination: this.recommendationForm.get('destination')?.value as string,
      passengerCount: Number(this.recommendationForm.get('passengerCount')?.value),
      maxPrice: Number(this.recommendationForm.get('maxPrice')?.value),
      preferredType: this.recommendationForm.get('preferredType')?.value as string
    };

    this.recommendationService.recommendTrips(request).subscribe({
      next: (results: TripRecommendationResponse[]) => {
        this.recommendations = [...results].sort((a, b) => b.score - a.score);
        this.isLoading = false;
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Unable to load trip recommendations.';
        this.recommendations = [];
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/transport']);
  }

  getScoreClass(score: number): string {
    if (score >= 70) {
      return 'score-high';
    }

    if (score >= 40) {
      return 'score-medium';
    }

    return 'score-low';
  }

  reserveAd(adId: number): void {
    this.router.navigate(['/transport/transport-ads'], { queryParams: { tripId: adId } });
  }
}
