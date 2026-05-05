// src/app/frontoffice/shared/services/review.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReviewRequest, ReviewResponse } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private baseUrl = 'http://localhost:8088/campConnect/review';

  constructor(private http: HttpClient) {}

  addReview(equipmentId: number, dto: ReviewRequest): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(`${this.baseUrl}/equipment/${equipmentId}`, dto);
  }

  getReviewsByEquipment(equipmentId: number): Observable<ReviewResponse[]> {
    return this.http.get<ReviewResponse[]>(`${this.baseUrl}/equipment/${equipmentId}`);
  }

  updateReview(reviewId: number, dto: ReviewRequest): Observable<ReviewResponse> {
    return this.http.put<ReviewResponse>(`${this.baseUrl}/${reviewId}`, dto);
  }

  deleteReview(reviewId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${reviewId}`);
  }
}