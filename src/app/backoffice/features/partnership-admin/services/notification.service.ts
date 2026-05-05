import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

export interface AppNotification {
  id: number;
  recipientId: number;
  message: string;
  type: string;
  channel: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private stompClient: Client | null = null;
  private readonly WS_URL = 'http://localhost:8088/campConnect/ws';
  private readonly API_URL = 'http://localhost:8088/campConnect/api/notifications';

  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  
  private newNotificationAlert = new Subject<AppNotification>();
  public newNotificationAlert$ = this.newNotificationAlert.asObservable();

  private currentUserId: number | null = null;

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  public connect(): void {
    if (this.stompClient?.active) {
      return;
    }
    
    const token = localStorage.getItem('token');

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(this.WS_URL),
      connectHeaders: {
        Authorization: token ? `Bearer ${token}` : ''
      },
      debug: (msg) => console.log(msg),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = () => {
      console.log('Connected to WS');
      // On s'abonne via un endpoint propre à l'utilisateur géré côté backend (par exemple /user/queue/notifications)
      // Mais comme le backend publie toujours sur /queue/notifications/{userId}, 
      // on peut extraire le userId depuis le token localement ou s'abonner via Principal
      // Pour éviter de parser le token côté client, on s'abonne à une route privée '/user/queue/notifications'
      this.stompClient?.subscribe(`/user/queue/notifications`, (message: Message) => {
        const notif: AppNotification = JSON.parse(message.body);
        this.handleNewNotification(notif);
      });
    };

    this.stompClient.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    this.stompClient.activate();
    
    // Fetch initial unread notifications
    this.fetchUnreadNotifications();
  }

  private handleNewNotification(notif: AppNotification): void {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([notif, ...current]);
    this.newNotificationAlert.next(notif);
    
    // Show toast
    this.toastr.info(notif.message, 'New Notification (' + notif.type + ')', {
      timeOut: 5000,
      progressBar: true
    });
  }

  public fetchUnreadNotifications(): void {
    this.http.get<AppNotification[]>(`${this.API_URL}/unread`).subscribe({
      next: (data) => this.notificationsSubject.next(data),
      error: (err) => console.error('Error fetching notifications', err)
    });
  }

  public markAsRead(notificationId: number): void {
    this.http.post(`${this.API_URL}/${notificationId}/read`, {}).subscribe({
      next: () => {
        const current = this.notificationsSubject.value;
        const updated = current.filter(n => n.id !== notificationId);
        this.notificationsSubject.next(updated);
      },
      error: (err) => console.error('Error marking as read', err)
    });
  }

  public disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
