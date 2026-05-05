import { Component, OnInit } from '@angular/core';
import { DeliveryService } from '../../../../shared/services/delivery.service';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-delivery-page',
  templateUrl: './delivery-page.component.html',
  styleUrls: ['./delivery-page.component.css']
})
export class DeliveryPageComponent implements OnInit {

  activeTab: 'available' | 'my-deliveries' = 'available';

  pendingDeliveries: any[] = [];
  loadingPending = true;

  myDeliveries: any[] = [];
  loadingMine = false;

  toastMsg = '';
  toastType = 'success';
  userId: number | null = null;

  constructor(
    private deliveryService: DeliveryService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getIdUser();
    this.loadPending();
  }

  loadPending(): void {
    this.loadingPending = true;
    this.deliveryService.getPendingDeliveries().subscribe({
      next: data => { this.pendingDeliveries = data; this.loadingPending = false; },
      error: () => this.loadingPending = false
    });
  }

  loadMyDeliveries(): void {
    if (!this.userId) return;
    this.loadingMine = true;
    this.deliveryService.getMyDeliveries(this.userId).subscribe({
      next: data => { this.myDeliveries = data; this.loadingMine = false; },
      error: () => this.loadingMine = false
    });
  }

  onTabChange(tab: 'available' | 'my-deliveries'): void {
    this.activeTab = tab;
    if (tab === 'my-deliveries') this.loadMyDeliveries();
    if (tab === 'available') this.loadPending();
  }

 

  markDelivered(deliveryId: number): void {
    if (!this.userId) return;
    if (!confirm('Mark as delivered?')) return;
    this.deliveryService.markDelivered(deliveryId, this.userId).subscribe({
      next: () => {
        this.showToast('🎉 Marked as delivered!', 'success');
        this.loadMyDeliveries();
      },
      error: (err) => this.showToast(err.error?.message || '❌ Failed.', 'danger')
    });
  }

  getStateBadge(state: string): string {
    const map: any = {
      'PENDING': 'bg-warning text-dark',
      'ON_THE_WAY': 'bg-primary',
      'DELIVERED': 'bg-success',
      'CANCELLED': 'bg-danger'
    };
    return map[state] || 'bg-secondary';
  }

  showToast(msg: string, type: string): void {
    this.toastMsg = msg;
    this.toastType = type;
    setTimeout(() => this.toastMsg = '', 3000);
  }
  selectedDate: string = '';
showDatePicker: number | null = null; 

openDatePicker(deliveryId: number): void {
  this.showDatePicker = deliveryId;
  // date minimum = demain
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  this.selectedDate = tomorrow.toISOString().split('T')[0];
}

confirmTakeDelivery(deliveryId: number): void {
  if (!this.userId || !this.selectedDate) return;
  this.deliveryService.takeDelivery(deliveryId, this.userId, 
                                    this.selectedDate).subscribe({
    next: () => {
      this.showDatePicker = null;
      this.showToast('✅ Delivery taken!', 'success');
      this.loadPending();
      this.loadMyDeliveries();
      this.activeTab = 'my-deliveries';
    },
    error: (err) => this.showToast(err.error?.message || '❌ Failed.', 'danger')
  });
}
getTomorrow(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}
}
