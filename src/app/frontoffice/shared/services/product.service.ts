import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductRequest, ProductResponse } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {

 private api = 'http://localhost:8088/campConnect/api/products';

  constructor(private http: HttpClient) {}

  // ── Public ────────────────────────────────────────────────
  getApproved(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${this.api}/approved`);
  }

  getById(id: number): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.api}/${id}`);
  }

  // ── Authenticated ─────────────────────────────────────────
  getMyProducts(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${this.api}/my`);
  }

  add(product: ProductRequest): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(this.api, product);
  }

  update(id: number, product: ProductRequest): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.api}/${id}`, product);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  // ── Admin ─────────────────────────────────────────────────
  getAll(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(this.api);
  }

  getPending(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${this.api}/pending`);
  }

  approve(id: number): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.api}/${id}/approve`, {});
  }

  reject(id: number): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.api}/${id}/reject`, {});
  }
  getSalesStats() {
    return this.http.get<any[]>(`${this.api}/sales-stats`);
  }

  getNearby(lat: number, lng: number, radius: number): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${this.api}/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  }

  getRecommendations(productId: number, topN: number = 4): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(
      `http://localhost:8088/campConnect/api/recommendations/${productId}?topN=${topN}`
    );
  }
}