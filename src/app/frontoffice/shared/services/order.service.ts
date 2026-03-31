import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem, OrderDTO, OrderRequest } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {

  // ─── API URL ─────────────────────────────────────
  private apiUrl = 'http://localhost:8088/campConnect/api/orders';

  // ─── Cart state ──────────────────────────────────
  private cartSubject = new BehaviorSubject<CartItem[]>(
    JSON.parse(localStorage.getItem('cart') || '[]')
  );
  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ─── Cart Methods ────────────────────────────────
  getCart(): CartItem[] {
    return this.cartSubject.getValue();
  }

  addToCart(product: any, qty: number = 1): void {
    const cart = this.getCart();
    const existing = cart.find(i => i.product.idProduct === product.idProduct);

    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({ product, quantity: qty });
    }

    this.saveCart(cart);
  }

  removeFromCart(productId: number): void {
    const updated = this.getCart().filter(i => i.product.idProduct !== productId);
    this.saveCart(updated);
  }

  updateQuantity(productId: number, qty: number): void {
    const cart = this.getCart();
    const item = cart.find(i => i.product.idProduct === productId);
    if (item) item.quantity = Math.max(1, qty);
    this.saveCart(cart);
  }

  clearCart(): void {
    this.saveCart([]);
  }

  getCartTotal(): number {
    return this.getCart().reduce((sum, i) => sum + i.product.priceProduct * i.quantity, 0);
  }

  getCartCount(): number {
    return this.getCart().reduce((sum, i) => sum + i.quantity, 0);
  }

  private saveCart(cart: CartItem[]): void {
    this.cartSubject.next([...cart]);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }

  // ─── User / API Methods ─────────────────────────
  createOrder(request: OrderRequest): Observable<OrderDTO> {
    return this.http.post<OrderDTO>(this.apiUrl, request);
  }

  getAllOrders(): Observable<OrderDTO[]> {
    return this.http.get<OrderDTO[]>(this.apiUrl);
  }

  getMyOrders(userId: number): Observable<OrderDTO[]> {
    return this.http.get<OrderDTO[]>(`${this.apiUrl}/user/${userId}`);
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  confirmOrder(id: number): Observable<OrderDTO> {
    return this.http.put<OrderDTO>(`${this.apiUrl}/${id}/confirm`, {});
  }

  cancelOrder(id: number): Observable<OrderDTO> {
    return this.http.put<OrderDTO>(`${this.apiUrl}/${id}/cancel`, {});
  }

  // ─── Admin / Approve & Reject ───────────────────
  getConfirmedOrders(): Observable<OrderDTO[]> {
    return this.http.get<OrderDTO[]>(`${this.apiUrl}/confirmed`);
  }

  approveOrder(id: number): Observable<OrderDTO> {
    return this.http.put<OrderDTO>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectOrder(id: number): Observable<OrderDTO> {
    return this.http.put<OrderDTO>(`${this.apiUrl}/${id}/reject`, {});
  }
}