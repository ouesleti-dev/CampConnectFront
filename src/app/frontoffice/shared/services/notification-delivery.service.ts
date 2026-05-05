import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

declare var SockJS: any;
declare var Stomp: any;

@Injectable({ providedIn: 'root' })
export class NotificationDeliveryService implements OnDestroy {
  private apiUrl = 'http://localhost:8088/campConnect/api/notifications';
  private wsUrl = 'http://localhost:8088/campConnect/ws';

  private stompClient: any = null;
  private notifications$ = new BehaviorSubject<any[]>([]);
  private unreadCount$ = new BehaviorSubject<number>(0);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  connect(): void {
    const userId = this.authService.getIdUser();
    if (!userId) return;

    this.loadNotifications(userId);
    this.loadUnreadCount(userId);

    const socket = new SockJS(this.wsUrl);
    this.stompClient = Stomp.over(socket);
    this.stompClient.debug = null;

    this.stompClient.connect({}, () => {
      this.stompClient.subscribe(
        `/topic/notifications/${userId}`,
        (message: any) => {
          const notification = JSON.parse(message.body);
          const current = this.notifications$.value;
          this.notifications$.next([notification, ...current]);
          this.unreadCount$.next(this.unreadCount$.value + 1);
        }
      );
    });
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect();
      this.stompClient = null;
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  getNotifications(): Observable<any[]> {
    return this.notifications$.asObservable();
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$.asObservable();
  }

  loadNotifications(userId: number): void {
    this.http.get<any[]>(`${this.apiUrl}/${userId}`).subscribe({
      next: (data) => this.notifications$.next(data),
      error: () => {}
    });
  }

  loadUnreadCount(userId: number): void {
    this.http.get<any>(`${this.apiUrl}/${userId}/unread-count`).subscribe({
      next: (data) => this.unreadCount$.next(data.count),
      error: () => {}
    });
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${notificationId}/read`, {});
  }

  markAllAsRead(userId: number): void {
    this.http.put<void>(`${this.apiUrl}/${userId}/read-all`, {}).subscribe({
      next: () => {
        this.unreadCount$.next(0);
        const updated = this.notifications$.value.map(n => ({ ...n, read: true }));
        this.notifications$.next(updated);
      }
    });
  }
}
