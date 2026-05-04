import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { NotificationDeliveryService } from '../../services/notification-delivery.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-bell',
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.css']
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  notifications: any[] = [];
  unreadCount = 0;
  isOpen = false;

  private notifSub!: Subscription;
  private countSub!: Subscription;

  constructor(
    private notificationService: NotificationDeliveryService,
    private authService: AuthService,
    private elRef: ElementRef
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.notificationService.connect();

      this.notifSub = this.notificationService.getNotifications().subscribe(
        data => this.notifications = data
      );

      this.countSub = this.notificationService.getUnreadCount().subscribe(
        count => this.unreadCount = count
      );
    }
  }

  ngOnDestroy(): void {
    this.notifSub?.unsubscribe();
    this.countSub?.unsubscribe();
    this.notificationService.disconnect();
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  markAsRead(notification: any): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.idNotification).subscribe(() => {
        notification.read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      });
    }
  }

  markAllAsRead(): void {
    const userId = this.authService.getIdUser();
    if (userId) {
      this.notificationService.markAllAsRead(userId);
    }
  }

  getTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return diffMin + 'm ago';
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return diffHours + 'h ago';
    const diffDays = Math.floor(diffHours / 24);
    return diffDays + 'd ago';
  }

  getIcon(type: string): string {
    switch (type) {
      case 'DELIVERY_TAKEN': return 'pickup';
      case 'DELIVERY_COMPLETED': return 'delivered';
      default: return 'default';
    }
  }
}
