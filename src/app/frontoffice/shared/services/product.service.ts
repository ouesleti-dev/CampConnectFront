import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductRequest, ProductResponse } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {

 private api = 'https://campconnect-backend-gtcgcgcpefbqh4gb.austriaeast-01.azurewebsites.net/campConnect/api/products';

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
}
