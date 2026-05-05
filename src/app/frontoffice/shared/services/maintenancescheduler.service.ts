import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'; // ✅ HttpHeaders ajouté
import { Observable } from 'rxjs';

export interface MaintenanceSlot {
  start:           string;
  end:             string;
  bufferDaysAfter: number;
}

export interface ImpactResult {
  affectedRentalCount: number;
  affectedEmails:      string[];
  equipmentName:       string;
}

export interface MaintenanceResponse {
  id:            number;
  startDate:     string;
  endDate:       string;
  description:   string;
  kind:          string;
  equipmentId:   number;
  equipmentName: string;
}

@Injectable({ providedIn: 'root' })
export class MaintenanceService {

  private API = 'http://localhost:8088/campConnect/api/maintenance-scheduler';

  constructor(private http: HttpClient) {}

  // ✅ Helper token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getSuggestedSlots(equipmentId: number, durationDays: number): Observable<MaintenanceSlot[]> {
    const params = new HttpParams()
      .set('equipmentId', equipmentId)
      .set('durationDays', durationDays);
    return this.http.get<MaintenanceSlot[]>(
      `${this.API}/suggest`, { headers: this.getHeaders(), params }); // ✅
  }

  getImpact(equipmentId: number, start: string, end: string): Observable<ImpactResult> {
    const params = new HttpParams()
      .set('equipmentId', equipmentId)
      .set('start', start)
      .set('end', end);
    return this.http.get<ImpactResult>(
      `${this.API}/impact`, { headers: this.getHeaders(), params }); // ✅
  }

  confirm(body: any): Observable<MaintenanceResponse> {
    return this.http.post<MaintenanceResponse>(
      `${this.API}/confirm`, body, { headers: this.getHeaders() }); // ✅
  }
}