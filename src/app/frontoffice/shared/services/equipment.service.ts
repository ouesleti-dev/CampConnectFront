// src/app/frontoffice/shared/services/equipment.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EquipmentRequest, EquipmentResponse } from '../models/equipment.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {

  private baseUrl = 'http://localhost:8088/campConnect/equipment';

  constructor(private http: HttpClient) {}

  createEquipment(dto: EquipmentRequest): Observable<EquipmentResponse> {
    return this.http.post<EquipmentResponse>(this.baseUrl, dto);
  }

  getMyEquipments(): Observable<EquipmentResponse[]> {
    return this.http.get<EquipmentResponse[]>(`${this.baseUrl}/my`);
  }

  getVerifiedEquipments(): Observable<EquipmentResponse[]> {
    return this.http.get<EquipmentResponse[]>(`${this.baseUrl}/verified`);
  }

  getUnverifiedEquipments(): Observable<EquipmentResponse[]> {
    return this.http.get<EquipmentResponse[]>(`${this.baseUrl}/unverified`);
  }

  verifyEquipment(id: number): Observable<EquipmentResponse> {
    return this.http.put<EquipmentResponse>(`${this.baseUrl}/verify/${id}`, {});
  }

  deleteEquipment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
  updateEquipment(id: number, dto: EquipmentRequest): Observable<EquipmentResponse> {
  return this.http.put<EquipmentResponse>(`${this.baseUrl}/${id}`, dto);
}
// Dans ton equipment.service.ts existant

getEquipmentStats(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/stats`);
}

searchEquipments(type?: string, state?: string, maxPrice?: number): Observable<any[]> {
  let params = new HttpParams();
  if (type)     params = params.set('type', type);
  if (state)    params = params.set('state', state);
  if (maxPrice) params = params.set('maxPrice', maxPrice.toString());
  return this.http.get<any[]>(`${this.baseUrl}/search`, { params });
}
}
