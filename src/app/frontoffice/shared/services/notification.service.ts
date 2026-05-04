import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NotificationDto {
  id:               number;
  message:          string;
  type:             string;
  isRead:           boolean;
  createdAt:        string;
  equipmentName:    string;
  maintenanceStart: string;
  maintenanceEnd:   string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private API = 'http://localhost:8088/campConnect/api/notifications';

  constructor(private http: HttpClient) {}

  getAll(): Observable<NotificationDto[]> {
    return this.http.get<NotificationDto[]>(`${this.API}/my`);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${this.API}/unread-count`);
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(
      `${this.API}/mark-all-read`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}