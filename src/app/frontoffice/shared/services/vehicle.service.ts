import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VehicleRequest, VehicleResponse } from '../models/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private readonly baseUrl = 'https://campconnect-backend-gtcgcgcpefbqh4gb.austriaeast-01.azurewebsites.net/campConnect/vehicles';

  constructor(private http: HttpClient) {}

  getAllVehicles(): Observable<VehicleResponse[]> {
    return this.http.get<VehicleResponse[]>(this.baseUrl);
  }

  addVehicle(vehicle: VehicleRequest): Observable<VehicleResponse> {
    return this.http.post<VehicleResponse>(this.baseUrl, vehicle);
  }

  updateVehicle(vehicleId: number, vehicle: VehicleRequest): Observable<VehicleResponse> {
    return this.http.put<VehicleResponse>(`${this.baseUrl}/${vehicleId}`, vehicle);
  }

  deleteVehicle(vehicleId: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${vehicleId}`, { responseType: 'text' });
  }
}
