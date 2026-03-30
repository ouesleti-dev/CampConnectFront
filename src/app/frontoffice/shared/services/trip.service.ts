import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TripRequest, TripResponse } from '../models/trip.model';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private readonly baseUrl = 'http://localhost:8088/campConnect/trips';

  constructor(private http: HttpClient) {}

  createTrip(req: TripRequest): Observable<TripResponse> {
    return this.http.post<TripResponse>(this.baseUrl, req);
  }

  updateTrip(id: number, req: TripRequest): Observable<TripResponse> {
    return this.http.put<TripResponse>(`${this.baseUrl}/${id}`, req);
  }

  deleteTrip(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }

  getTripById(id: number): Observable<TripResponse> {
    return this.http.get<TripResponse>(`${this.baseUrl}/${id}`);
  }

  getAllTrips(): Observable<TripResponse[]> {
    return this.http.get<TripResponse[]>(this.baseUrl);
  }

  getTripsByVehicleId(vehicleId: number): Observable<TripResponse[]> {
    return this.http.get<TripResponse[]>(`${this.baseUrl}/vehicle/${vehicleId}`);
  }

  getTripsByDestination(dest: string): Observable<TripResponse[]> {
    return this.http.get<TripResponse[]>(`${this.baseUrl}/destination/${dest}`);
  }
}
