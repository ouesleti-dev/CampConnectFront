import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../../../frontoffice/shared/services/order.service';

@Component({
  selector: 'app-orders-page',
  templateUrl: './orders-page.component.html',
  styleUrls: ['./orders-page.component.css']
})
export class OrdersPageComponent implements OnInit {
  orders: any[] = [];
  loading = true;
  expandedId: number | null = null;
  successMsg = '';
  errorMsg = '';

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadConfirmedOrders();
  }

  loadConfirmedOrders(): void {
    this.loading = true;
    this.orderService.getConfirmedOrders().subscribe({
      next: data => { this.orders = data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  toggle(id: number): void {
    this.expandedId = this.expandedId === id ? null : id;
  }

  approve(orderId: number): void {
    if (!confirm('Approve this order and create delivery?')) return;
    this.orderService.approveOrder(orderId).subscribe({
      next: () => {
        this.orders = this.orders.filter(o => o.idOrder !== orderId);
        this.successMsg = '✅ Order approved! Delivery created.';
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => this.errorMsg = '❌ Failed to approve order.'
    });
  }

  reject(orderId: number): void {
    if (!confirm('Reject this order?')) return;
    this.orderService.rejectOrder(orderId).subscribe({
      next: () => {
        this.orders = this.orders.filter(o => o.idOrder !== orderId);
        this.successMsg = '🚫 Order rejected.';
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => this.errorMsg = '❌ Failed to reject order.'
    });
  }
}