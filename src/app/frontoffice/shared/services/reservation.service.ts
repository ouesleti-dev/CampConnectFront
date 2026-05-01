import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ReservationDetailsResponse,
  ReservationRequest,
  ReservationResponse
} from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private readonly baseUrl = 'http://localhost:8088/campConnect/reservations';

  constructor(private http: HttpClient) {}

  createReservation(req: ReservationRequest): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(this.baseUrl, req);
  }

  updateReservation(id: number, req: ReservationRequest): Observable<ReservationResponse> {
    return this.http.put<ReservationResponse>(`${this.baseUrl}/${id}`, req);
  }

  deleteReservation(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }

  getReservationById(id: number): Observable<ReservationResponse> {
    return this.http.get<ReservationResponse>(`${this.baseUrl}/${id}`);
  }

  getAllReservations(): Observable<ReservationResponse[]> {
    return this.http.get<ReservationResponse[]>(this.baseUrl);
  }

  getMyReservations(): Observable<ReservationResponse[]> {
    return this.http.get<ReservationResponse[]>(`${this.baseUrl}/my`);
  }

  getReservationDetails(): Observable<ReservationDetailsResponse[]> {
    return this.http.get<ReservationDetailsResponse[]>(`${this.baseUrl}/details`);
  }

  searchReservations(
    destination: string,
    transportType: string
  ): Observable<ReservationDetailsResponse[]> {
    let params = new HttpParams();

    if (destination.trim()) {
      params = params.set('destination', destination.trim());
    }

    if (transportType.trim()) {
      params = params.set('transportType', transportType.trim());
    }

    return this.http.get<ReservationDetailsResponse[]>(`${this.baseUrl}/search`, { params });
  }

  getByAdId(adId: number): Observable<ReservationResponse[]> {
    return this.http.get<ReservationResponse[]>(`${this.baseUrl}/ad/${adId}`);
  }
}
