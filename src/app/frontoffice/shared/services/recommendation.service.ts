import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TripRecommendationRequest,
  TripRecommendationResponse
} from '../models/recommendation.model';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private readonly baseUrl = 'http://localhost:8088/campConnect/recommendations';

  constructor(private http: HttpClient) {}

  recommendTrips(
    request: TripRecommendationRequest
  ): Observable<TripRecommendationResponse[]> {
    return this.http.post<TripRecommendationResponse[]>(`${this.baseUrl}/trips`, request);
  }
}
