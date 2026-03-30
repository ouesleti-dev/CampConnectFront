import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  OptionServiceRequest,
  OptionServiceResponse
} from '../models/option-service.model';

@Injectable({
  providedIn: 'root'
})
export class OptionServiceService {
  private readonly baseUrl = 'http://localhost:8088/campConnect/options';

  constructor(private http: HttpClient) {}

  createOption(req: OptionServiceRequest): Observable<OptionServiceResponse> {
    return this.http.post<OptionServiceResponse>(this.baseUrl, req);
  }

  updateOption(id: number, req: OptionServiceRequest): Observable<OptionServiceResponse> {
    return this.http.put<OptionServiceResponse>(`${this.baseUrl}/${id}`, req);
  }

  deleteOption(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }

  getOptionById(id: number): Observable<OptionServiceResponse> {
    return this.http.get<OptionServiceResponse>(`${this.baseUrl}/${id}`);
  }

  getAllOptions(): Observable<OptionServiceResponse[]> {
    return this.http.get<OptionServiceResponse[]>(this.baseUrl);
  }

  getByVehicleId(vehicleId: number): Observable<OptionServiceResponse[]> {
    return this.http.get<OptionServiceResponse[]>(`${this.baseUrl}/vehicle/${vehicleId}`);
  }

  getByType(optionType: string): Observable<OptionServiceResponse[]> {
    return this.http.get<OptionServiceResponse[]>(`${this.baseUrl}/type/${optionType}`);
  }
}
