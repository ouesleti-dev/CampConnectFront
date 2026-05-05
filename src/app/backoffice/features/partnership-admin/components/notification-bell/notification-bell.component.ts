import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, AppNotification } from '../../services/notification.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notif-wrapper">
      <button class="bell-btn" (click)="toggleDropdown($event)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <span class="badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
      </button>

      <div class="notif-dropdown" *ngIf="isOpen">
        <div class="dropdown-header">
          <h4>Notifications</h4>
          <span class="unread-text">{{ unreadCount }} unread</span>
        </div>
        
        <div class="notif-list">
          <div class="notif-empty" *ngIf="notifications.length === 0">
            No new notifications
          </div>
          
          <div class="notif-item" *ngFor="let notif of notifications" [class.unread]="!notif.isRead">
            <div class="notif-icon" [ngClass]="getIconClass(notif.type)">
              {{ getIcon(notif.type) }}
            </div>
            <div class="notif-content">
              <p class="notif-msg">{{ notif.message }}</p>
              <span class="notif-time">{{ notif.createdAt | date:'short' }}</span>
            </div>
            <button class="mark-read-btn" (click)="markAsRead(notif.id, $event)" title="Mark as read">✓</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notif-wrapper {
      position: relative;
    }
    .bell-btn {
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      position: relative;
      padding: 8px;
      border-radius: 50%;
      transition: all 0.2s;
    }
    .bell-btn:hover {
      background: #f1f5f9;
      color: #0f172a;
    }
    .badge {
      position: absolute;
      top: 0;
      right: 0;
      background: #ef4444;
      color: white;
      font-size: 10px;
      font-weight: bold;
      height: 16px;
      min-width: 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      border: 2px solid white;
    }
    .notif-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      width: 320px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
      z-index: 1000;
      margin-top: 8px;
      overflow: hidden;
    }
    .dropdown-header {
      padding: 12px 16px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
    }
    .dropdown-header h4 {
      margin: 0;
      font-size: 14px;
      color: #0f172a;
    }
    .unread-text {
      font-size: 12px;
      color: #3b82f6;
      font-weight: 500;
    }
    .notif-list {
      max-height: 350px;
      overflow-y: auto;
    }
    .notif-empty {
      padding: 24px;
      text-align: center;
      color: #94a3b8;
      font-size: 14px;
    }
    .notif-item {
      padding: 12px 16px;
      display: flex;
      gap: 12px;
      border-bottom: 1px solid #f1f5f9;
      transition: background 0.2s;
    }
    .notif-item:hover {
      background: #f8fafc;
    }
    .notif-item.unread {
      background: #eff6ff;
    }
    .notif-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
    }
    .notif-icon.status { background: #dbeafe; color: #3b82f6; }
    .notif-icon.interview { background: #dcfce7; color: #10b981; }
    .notif-icon.contract { background: #fee2e2; color: #ef4444; }
    
    .notif-content {
      flex: 1;
      min-width: 0;
    }
    .notif-msg {
      margin: 0 0 4px 0;
      font-size: 13px;
      color: #334155;
      line-height: 1.4;
    }
    .notif-time {
      font-size: 11px;
      color: #94a3b8;
    }
    .mark-read-btn {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      align-self: flex-start;
    }
    .mark-read-btn:hover {
      background: #e2e8f0;
      color: #3b82f6;
    }
  `]
})
export class NotificationBellComponent implements OnInit {
  isOpen = false;
  notifications: AppNotification[] = [];
  
  constructor(private notificationService: NotificationService, private eRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if(this.isOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(notifs => {
      this.notifications = notifs;
    });
    
    // Connects to WebSocket using JWT token automatically
    this.notificationService.connect();
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  markAsRead(id: number, event: Event): void {
    event.stopPropagation();
    this.notificationService.markAsRead(id);
  }

  getIcon(type: string): string {
    switch(type) {
      case 'STATUS_CHANGE': return '🔄';
      case 'INTERVIEW': return '📅';
      case 'CONTRACT_EXPIRATION': return '⚠️';
      default: return '🔔';
    }
  }

  getIconClass(type: string): string {
    switch(type) {
      case 'STATUS_CHANGE': return 'status';
      case 'INTERVIEW': return 'interview';
      case 'CONTRACT_EXPIRATION': return 'contract';
      default: return 'status';
    }
  }
}
