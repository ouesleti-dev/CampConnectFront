import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
}