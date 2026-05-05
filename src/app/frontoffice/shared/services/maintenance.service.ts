import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MaintenancePrediction } from '../models/maintenance-prediction.model';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {

  private baseUrl = 'http://localhost:8088/campConnect/api/maintenance';

  constructor(private http: HttpClient) {}

  predictForCurrentUser(): Observable<MaintenancePrediction[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<MaintenancePrediction[]>(
      `${this.baseUrl}/predict`,
      { headers }
    );
  }
}