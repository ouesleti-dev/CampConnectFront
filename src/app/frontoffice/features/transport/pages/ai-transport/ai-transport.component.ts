import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  TransportAiPriceRequest,
  TransportAiPriceResult
} from '../../../../shared/models/transport-ai.model';
import { TransportAiService } from '../../../../shared/services/transport-ai.service';

type AiTransportForm = FormGroup<{
  distanceKm: FormControl<number>;
  passengerCount: FormControl<number>;
  hour: FormControl<number>;
  weekday: FormControl<number>;
}>;

type AiTransportControlName = keyof AiTransportForm['controls'];

interface WeekdayOption {
  value: number;
  label: string;
}

interface ApiErrorBody {
  message?: string;
  error?: string;
}

@Component({
  selector: 'app-ai-transport',
  templateUrl: './ai-transport.component.html',
  styleUrls: ['./ai-transport.component.css']
})
export class AiTransportComponent {
  aiForm: AiTransportForm;
  isLoading = false;
  hasPrediction = false;
  predictedPrice: number | null = null;
  currency = 'TND';
  resultMessage = '';
  rawResultText = '';
  errorMessage = '';

  readonly weekdayOptions: WeekdayOption[] = [
    { value: 0, label: 'Monday' },
    { value: 1, label: 'Tuesday' },
    { value: 2, label: 'Wednesday' },
    { value: 3, label: 'Thursday' },
    { value: 4, label: 'Friday' },
    { value: 5, label: 'Saturday' },
    { value: 6, label: 'Sunday' }
  ];

  constructor(
    private fb: NonNullableFormBuilder,
    private transportAiService: TransportAiService,
    private router: Router
  ) {
    this.aiForm = this.fb.group({
      distanceKm: [10, [Validators.required, Validators.min(0.1)]],
      passengerCount: [1, [Validators.required, Validators.min(1)]],
      hour: [new Date().getHours(), [Validators.required, Validators.min(0), Validators.max(23)]],
      weekday: [this.getCurrentWeekday(), [Validators.required, Validators.min(0), Validators.max(6)]]
    });
  }

  predictPrice(): void {
    if (this.aiForm.invalid) {
      this.aiForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.hasPrediction = false;
    this.predictedPrice = null;
    this.rawResultText = '';
    this.resultMessage = '';

    const request = this.buildPriceRequest();

    this.transportAiService.predictPrice(request).subscribe({
      next: (response: TransportAiPriceResult) => {
        this.predictedPrice = this.extractPredictedPrice(response);
        this.currency = this.extractCurrency(response);
        this.resultMessage = this.extractResultMessage(response);
        this.rawResultText = this.formatRawResult(response);
        this.hasPrediction = true;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(error);
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/transport']);
  }

  isInvalid(controlName: AiTransportControlName): boolean {
    const control = this.aiForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  private getCurrentWeekday(): number {
    const sundayFirstWeekday = new Date().getDay();
    return (sundayFirstWeekday + 6) % 7;
  }

  private buildPriceRequest(): TransportAiPriceRequest {
    const value = this.aiForm.getRawValue();

    return {
      distance_km: Number(value.distanceKm),
      passenger_count: Number(value.passengerCount),
      hour: Number(value.hour),
      weekday: Number(value.weekday)
    };
  }

  private extractPredictedPrice(response: TransportAiPriceResult): number | null {
    if (typeof response === 'number') {
      return response;
    }

    const candidates = [
      response.predictedPrice,
      response.predicted_price,
      response.estimatedPrice,
      response.estimated_price,
      response.price,
      response.prediction
    ];

    return candidates.find((value): value is number => typeof value === 'number') ?? null;
  }

  private extractCurrency(response: TransportAiPriceResult): string {
    if (typeof response === 'number') {
      return 'TND';
    }

    return response.currency || 'TND';
  }

  private extractResultMessage(response: TransportAiPriceResult): string {
    if (typeof response === 'number') {
      return 'Prediction completed successfully.';
    }

    return response.message || 'Prediction completed successfully.';
  }

  private formatRawResult(response: TransportAiPriceResult): string {
    if (typeof response === 'number') {
      return response.toString();
    }

    return JSON.stringify(response, null, 2);
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    const body: unknown = error.error;

    if (typeof body === 'string' && body.trim()) {
      return body;
    }

    if (this.isApiErrorBody(body)) {
      return body.message || body.error || 'Unable to predict transport price.';
    }

    return 'Unable to predict transport price. Please try again.';
  }

  private isApiErrorBody(value: unknown): value is ApiErrorBody {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const candidate = value as Record<string, unknown>;
    return typeof candidate['message'] === 'string' || typeof candidate['error'] === 'string';
  }
}
