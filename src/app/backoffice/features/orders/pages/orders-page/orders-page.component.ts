import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../../../frontoffice/shared/services/order.service';
import { DeliveryService } from '../../../../../frontoffice/shared/services/delivery.service';
import { CouponService } from '../../../../../frontoffice/shared/services/coupon.service';
import { CouponResponse, CouponRequest } from '../../../../../frontoffice/shared/models/coupon.model';

@Component({
  selector: 'app-orders-page',
  templateUrl: './orders-page.component.html',
  styleUrls: ['./orders-page.component.css']
})
export class OrdersPageComponent implements OnInit {
  orders: any[] = [];
  deliveryStats: any[] = [];
  loading = true;
  expandedId: number | null = null;
  successMsg = '';
  errorMsg = '';

  // Coupon management
  coupons: CouponResponse[] = [];
  couponsLoading = false;
  showCouponForm = false;
  couponForm: CouponRequest = { code: '', discountPercentage: 10, expirationDate: '', maxUses: 100 };
  couponSuccessMsg = '';
  couponErrorMsg = '';

  constructor(
    private orderService: OrderService,
    private deliveryService: DeliveryService,
    private couponService: CouponService
  ) {}

  ngOnInit(): void {
    this.loadConfirmedOrders();
    this.loadDeliveryStats();
    this.loadCoupons();
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
        this.successMsg = 'Order approved. Delivery created.';
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => this.errorMsg = 'Failed to approve order.'
    });
  }

  reject(orderId: number): void {
    if (!confirm('Reject this order?')) return;
    this.orderService.rejectOrder(orderId).subscribe({
      next: () => {
        this.orders = this.orders.filter(o => o.idOrder !== orderId);
        this.successMsg = 'Order rejected.';
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => this.errorMsg = 'Failed to reject order.'
    });
  }
  loadDeliveryStats(): void {
    this.deliveryService.getTopPerformers().subscribe({
      next: (res) => this.deliveryStats = res,
      error: (err) => console.error(err)
    });
  }

  // ─── Coupon Management ───────────────────────
  loadCoupons(): void {
    this.couponsLoading = true;
    this.couponService.getAll().subscribe({
      next: (res) => { this.coupons = res; this.couponsLoading = false; },
      error: () => this.couponsLoading = false
    });
  }

  createCoupon(): void {
    if (!this.couponForm.code.trim()) return;
    this.couponErrorMsg = '';
    this.couponSuccessMsg = '';
    this.couponService.create(this.couponForm).subscribe({
      next: (res) => {
        this.coupons.unshift(res);
        this.couponSuccessMsg = 'Coupon created successfully.';
        this.showCouponForm = false;
        this.couponForm = { code: '', discountPercentage: 10, expirationDate: '', maxUses: 100 };
        setTimeout(() => this.couponSuccessMsg = '', 3000);
      },
      error: () => { this.couponErrorMsg = 'Failed to create coupon.'; }
    });
  }

  toggleCoupon(id: number): void {
    this.couponService.toggle(id).subscribe({
      next: (res) => {
        const idx = this.coupons.findIndex(c => c.idCoupon === id);
        if (idx !== -1) this.coupons[idx] = res;
      }
    });
  }

  deleteCoupon(id: number): void {
    if (!confirm('Delete this coupon?')) return;
    this.couponService.delete(id).subscribe({
      next: () => { this.coupons = this.coupons.filter(c => c.idCoupon !== id); }
    });
  }
}