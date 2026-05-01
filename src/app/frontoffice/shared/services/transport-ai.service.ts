import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TransportAiCoordinatesRequest,
  TransportAiPriceRequest,
  TransportAiPriceResult
} from '../models/transport-ai.model';

@Injectable({
  providedIn: 'root'
})
export class TransportAiService {
  private readonly baseUrl = 'http://localhost:8088/campConnect/transport-ai';

  constructor(private http: HttpClient) {}

  predictPrice(request: TransportAiPriceRequest): Observable<TransportAiPriceResult> {
    return this.http.post<TransportAiPriceResult>(`${this.baseUrl}/predict-price`, request);
  }

  predictByCoordinates(request: TransportAiCoordinatesRequest): Observable<TransportAiPriceResult> {
    return this.http.post<TransportAiPriceResult>(`${this.baseUrl}/predict-by-coordinates`, request);
  }

  checkHealth(): Observable<string> {
    return this.http.get(`${this.baseUrl}/health`, { responseType: 'text' });
  }
}
