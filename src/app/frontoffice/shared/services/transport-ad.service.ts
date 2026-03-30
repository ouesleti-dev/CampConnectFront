import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TransportAdRequest,
  TransportAdResponse
} from '../models/transport-ad.model';

@Injectable({
  providedIn: 'root'
})
export class TransportAdService {
  private readonly baseUrl = 'http://localhost:8088/campConnect/transport-ads';

  constructor(private http: HttpClient) {}

  createAd(req: TransportAdRequest): Observable<TransportAdResponse> {
    return this.http.post<TransportAdResponse>(this.baseUrl, req);
  }

  updateAd(id: number, req: TransportAdRequest): Observable<TransportAdResponse> {
    return this.http.put<TransportAdResponse>(`${this.baseUrl}/${id}`, req);
  }

  deleteAd(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }

  getAdById(id: number): Observable<TransportAdResponse> {
    return this.http.get<TransportAdResponse>(`${this.baseUrl}/${id}`);
  }

  getAllAds(): Observable<TransportAdResponse[]> {
    return this.http.get<TransportAdResponse[]>(this.baseUrl);
  }

  getByTripId(tripId: number): Observable<TransportAdResponse[]> {
    return this.http.get<TransportAdResponse[]>(`${this.baseUrl}/trip/${tripId}`);
  }
}
