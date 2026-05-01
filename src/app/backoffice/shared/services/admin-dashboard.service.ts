import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TransportStatsResponse } from '../models/transport-stats.model';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {

  private baseUrl = 'http://localhost:8088/campConnect/admin/dashboard';

  constructor(private http: HttpClient) {}

  getTransportStats(): Observable<TransportStatsResponse> {
    return this.http.get<TransportStatsResponse>(
      `${this.baseUrl}/transport-stats`
    );
  }
}