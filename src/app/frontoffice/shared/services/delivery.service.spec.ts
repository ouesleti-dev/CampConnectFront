import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DeliveryService } from './delivery.service';

describe('DeliveryService', () => {
  let service: DeliveryService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8088/campConnect/api/deliveries';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DeliveryService]
    });
    service = TestBed.inject(DeliveryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get pending deliveries', () => {
    const mock = [{ idDelivery: 1, deliveryState: 'PENDING' }];

    service.getPendingDeliveries().subscribe(res => {
      expect(res.length).toBe(1);
      expect(res[0].deliveryState).toBe('PENDING');
    });

    const req = httpMock.expectOne(`${apiUrl}/pending`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('should get my deliveries by userId', () => {
    const mock = [{ idDelivery: 2, deliveryState: 'ON_THE_WAY' }];

    service.getMyDeliveries(1).subscribe(res => {
      expect(res.length).toBe(1);
    });

    const req = httpMock.expectOne(`${apiUrl}/my/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('should take delivery via PUT', () => {
    service.takeDelivery(1, 1, '2026-04-10').subscribe();

    const req = httpMock.expectOne(`${apiUrl}/1/take`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.userId).toBe(1);
    req.flush({});
  });

  it('should mark delivery as delivered', () => {
    service.markDelivered(1, 1).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/1/deliver/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('should get deliveries by order', () => {
    const mock = [{ idDelivery: 1 }];

    service.getDeliveriesByOrder(5).subscribe(res => {
      expect(res.length).toBe(1);
    });

    const req = httpMock.expectOne(`${apiUrl}/order/5`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });
});