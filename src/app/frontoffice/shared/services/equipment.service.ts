// src/app/frontoffice/shared/services/equipment.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EquipmentRequest, EquipmentResponse } from '../models/equipment.model';

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {

  private baseUrl = 'https://campconnect-backend-gtcgcgcpefbqh4gb.austriaeast-01.azurewebsites.net/campConnect/equipment';

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
}
