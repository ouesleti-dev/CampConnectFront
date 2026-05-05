import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  private apiUrl = 'http://localhost:8088/campConnect/api/deliveries';

  constructor(private http: HttpClient) {}

  getPendingDeliveries(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pending`);
  }

  getMyDeliveries(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my/${userId}`);
  }

  getAllDeliveries(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getDeliveriesByOrder(orderId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/order/${orderId}`);
  }

  takeDelivery(deliveryId: number, userId: number,
             estimatedDate: string): Observable<any> {
  return this.http.put(`${this.apiUrl}/${deliveryId}/take`, {
    userId,
    estimatedDeliveryDate: estimatedDate
  });
}

  markDelivered(deliveryId: number, userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${deliveryId}/deliver/${userId}`, {});
  }
  getActiveDeliveriesForCustomer(customerId: number): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.apiUrl}/customer/${customerId}/active`
  );
}
getTopPerformers(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/stats/top-performers`);
}

 previewFee(
  departure: string, arrival: string,
  fromLat?: number, fromLng?: number,
  toLat?: number,   toLng?: number
): Observable<any> {
  let params: any = { departure, arrival };

  // Si coords dispo → les envoyer pour éviter le géocodage
  if (fromLat != null && fromLng != null && toLat != null && toLng != null) {
    params = { ...params, fromLat, fromLng, toLat, toLng };
  }

  return this.http.get(`${this.apiUrl}/fee-preview`, { params });
}
}