import { Component, OnInit } from '@angular/core';
import { NotificationService, NotificationDto }
  from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-notification-bell',
  templateUrl: './notification-bell.component.html',
  styleUrls:   ['./notification-bell.component.css']
})
export class NotificationBellComponent implements OnInit {

  notifications: NotificationDto[] = [];
  unreadCount = 0;

  constructor(private svc: NotificationService) {}

  ngOnInit(): void {
    this.loadAll();    // ✅ charge au chargement de la page
    this.loadCount();
  }

  loadAll(): void {
    this.svc.getAll().subscribe(
      data => this.notifications = data);
  }

  loadCount(): void {
    this.svc.getUnreadCount().subscribe(
      data => this.unreadCount = data.count);
  }

  markAllRead(): void {
    this.svc.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
      this.unreadCount = 0;
    });
  }

  remove(id: number): void {
    this.svc.delete(id).subscribe(() => {
      this.notifications = this.notifications.filter(n => n.id !== id);
      this.loadCount();
    });
  }
}