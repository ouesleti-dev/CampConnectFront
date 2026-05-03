import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductReviewRequest, ProductReviewResponse } from '../models/product-review.model';

@Injectable({ providedIn: 'root' })
export class ProductReviewService {
  private api = 'http://localhost:8088/campConnect/api/product-reviews';

  constructor(private http: HttpClient) {}

  addReview(request: ProductReviewRequest): Observable<ProductReviewResponse> {
    return this.http.post<ProductReviewResponse>(this.api, request);
  }

  getReviewsByProduct(productId: number): Observable<ProductReviewResponse[]> {
    return this.http.get<ProductReviewResponse[]>(`${this.api}/product/${productId}`);
  }

  hasUserReviewed(userId: number, productId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.api}/check?userId=${userId}&productId=${productId}`);
  }
}
