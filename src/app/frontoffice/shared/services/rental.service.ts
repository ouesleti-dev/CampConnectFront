import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RentalRequest, RentalResponse } from '../models/rental.model';

@Injectable({ providedIn: 'root' })
export class RentalService {
  private baseUrl = 'http://localhost:8088/campConnect/rental';

  constructor(private http: HttpClient) {}

  requestRental(dto: RentalRequest): Observable<RentalResponse> {
    return this.http.post<RentalResponse>(`${this.baseUrl}/request`, dto);
  }

  acceptRental(id: number): Observable<RentalResponse> {
    return this.http.put<RentalResponse>(`${this.baseUrl}/accept/${id}`, {});
  }

  getMyRentals(): Observable<RentalResponse[]> {
    return this.http.get<RentalResponse[]>(`${this.baseUrl}/my-rentals`);
  }

  getReceivedRentals(): Observable<RentalResponse[]> {
    return this.http.get<RentalResponse[]>(`${this.baseUrl}/received`);
  }
  getReservedDates(equipmentId: number): Observable<{startDate: string, endDate: string}[]> {
  return this.http.get<{startDate: string, endDate: string}[]>(
    `${this.baseUrl}/reserved-dates/${equipmentId}`
  );
}
deleteRental(id: number): Observable<void> {
  return this.http.delete<void>(`${this.baseUrl}/${id}`);
}

updateRental(id: number, dto: RentalRequest): Observable<RentalResponse> {
  return this.http.put<RentalResponse>(`${this.baseUrl}/${id}`, dto);
}
}
