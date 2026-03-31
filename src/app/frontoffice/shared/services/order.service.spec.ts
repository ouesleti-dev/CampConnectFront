import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrderService } from './order.service';

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8088/campConnect/api/orders';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrderService]
    });

    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.clear();
  });

  afterEach(() => httpMock.verify());

  // ── Cart Tests ─────────────────────────────────────────
  it('should add product to cart', () => {
    const product = { idProduct: 1, nameProduct: 'Tent', priceProduct: 50 };
    service.addToCart(product, 2);

    const cart = service.getCart();
    expect(cart.length).toBe(1);
    expect(cart[0].quantity).toBe(2);
    expect(cart[0].product.nameProduct).toBe('Tent');
  });

  it('should increase quantity when same product added twice', () => {
    const product = { idProduct: 1, nameProduct: 'Tent', priceProduct: 50 };
    service.addToCart(product, 1);
    service.addToCart(product, 2);

    const cart = service.getCart();
    expect(cart.length).toBe(1);
    expect(cart[0].quantity).toBe(3);
  });

  it('should remove product from cart', () => {
    const product = { idProduct: 1, nameProduct: 'Tent', priceProduct: 50 };
    service.addToCart(product, 1);
    service.removeFromCart(1);

    expect(service.getCart().length).toBe(0);
  });

  it('should calculate cart total correctly', () => {
    service.addToCart({ idProduct: 1, priceProduct: 50 }, 2); // 100
    service.addToCart({ idProduct: 2, priceProduct: 30 }, 1); // 30
    expect(service.getCartTotal()).toBe(130); // 100 + 30
  });

  it('should get cart count correctly', () => {
    service.clearCart();
    service.addToCart({ idProduct: 1, priceProduct: 50 }, 2); 
    service.addToCart({ idProduct: 2, priceProduct: 30 }, 1); 
    expect(service.getCartCount()).toBe(3);
  });

  // ── API Tests ─────────────────────────────────────────
  it('should create order via POST', () => {
    const request = { userId: 1, deliveryAddress: 'Tunis', paymentMethod: 'CASH', items: [] };
    const mockResponse = { idOrder: 1, totalAmount: 100 };

    service.createOrder(request as any).subscribe(res => {
      expect(res.idOrder).toBe(1);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should get all orders via GET', () => {
    const mockOrders = [{ idOrder: 1 }, { idOrder: 2 }];
    service.getAllOrders().subscribe(orders => {
      expect(orders.length).toBe(2);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockOrders);
  });

  it('should get orders by user via GET', () => {
    const mockOrders = [{ idOrder: 1 }];
    service.getMyOrders(1).subscribe(orders => {
      expect(orders.length).toBe(1);
    });

    const req = httpMock.expectOne(`${apiUrl}/user/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockOrders);
  });

  it('should confirm order via PUT', () => {
    service.confirmOrder(1).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1/confirm`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('should cancel order via PUT', () => {
    service.cancelOrder(1).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1/cancel`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('should delete order via DELETE', () => {
    service.deleteOrder(1).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should approve order via PUT', () => {
    service.approveOrder(1).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1/approve`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('should reject order via PUT', () => {
    service.rejectOrder(1).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1/reject`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });
});