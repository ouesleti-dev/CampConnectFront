// shared/services/demand.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DemandDecision } from '../models/demand.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DemandService {

  private apiUrl = 'http://localhost:8088/campConnect';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getAllDecisions(): Observable<DemandDecision[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<DemandDecision[]>(`${this.apiUrl}/demand/decisions`, { headers });
  }
}