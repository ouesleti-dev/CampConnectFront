import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CouponRequest, CouponResponse } from '../models/coupon.model';

@Injectable({ providedIn: 'root' })
export class CouponService {
  private api = 'http://localhost:8088/campConnect/api/coupons';

  constructor(private http: HttpClient) {}

  validate(code: string): Observable<CouponResponse> {
    return this.http.get<CouponResponse>(`${this.api}/validate/${code}`);
  }

  // Admin
  create(request: CouponRequest): Observable<CouponResponse> {
    return this.http.post<CouponResponse>(this.api, request);
  }

  getAll(): Observable<CouponResponse[]> {
    return this.http.get<CouponResponse[]>(this.api);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  toggle(id: number): Observable<CouponResponse> {
    return this.http.put<CouponResponse>(`${this.api}/${id}/toggle`, {});
  }
}
