// src/app/frontoffice/shared/services/rental.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RentalService } from './rental.service';
import { RentalRequest, RentalResponse } from '../models/rental.model';

describe('RentalService', () => {
  let service: RentalService;
  let httpMock: HttpTestingController;

  const dummyRentalResponse: RentalResponse = {
    rentalId: 1,
    startDate: '2026-04-01',
    endDate: '2026-04-05',
    totalAmount: 200,
    verified: true,
    renterEmail: 'renter@example.com',
    ownerEmail: 'owner@example.com',
    equipmentId: 10,
    equipmentName: 'Tente'
  };

  const dummyRentalArray: RentalResponse[] = [
    dummyRentalResponse,
    {
      rentalId: 2,
      startDate: '2026-04-10',
      endDate: '2026-04-12',
      totalAmount: 120,
      verified: false,
      renterEmail: 'ali@example.com',
      ownerEmail: 'owner@example.com',
      equipmentId: 11,
      equipmentName: 'Sac à dos'
    }
  ];

  const dummyReservedDates = [
    { startDate: '2026-04-01', endDate: '2026-04-05' },
    { startDate: '2026-04-10', endDate: '2026-04-12' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RentalService]
    });

    service = TestBed.inject(RentalService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request rental', () => {
    const dto: RentalRequest = { equipmentId: 10, startDate: '2026-04-01', endDate: '2026-04-05' };

    service.requestRental(dto).subscribe(res => {
      expect(res).toEqual(dummyRentalResponse);
    });

    const req = httpMock.expectOne('http://localhost:8088/campConnect/rental/request');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(dummyRentalResponse);
  });

  it('should accept rental', () => {
    const id = 1;

    service.acceptRental(id).subscribe(res => {
      expect(res).toEqual(dummyRentalResponse);
    });

    const req = httpMock.expectOne(`http://localhost:8088/campConnect/rental/accept/${id}`);
    expect(req.request.method).toBe('PUT');
    req.flush(dummyRentalResponse);
  });

  it('should get my rentals', () => {
    service.getMyRentals().subscribe(res => {
      expect(res).toEqual(dummyRentalArray);
      expect(res.length).toBe(2);
    });

    const req = httpMock.expectOne('http://localhost:8088/campConnect/rental/my-rentals');
    expect(req.request.method).toBe('GET');
    req.flush(dummyRentalArray);
  });

  it('should get received rentals', () => {
    service.getReceivedRentals().subscribe(res => {
      expect(res).toEqual(dummyRentalArray);
      expect(res.length).toBe(2);
    });

    const req = httpMock.expectOne('http://localhost:8088/campConnect/rental/received');
    expect(req.request.method).toBe('GET');
    req.flush(dummyRentalArray);
  });

  it('should get reserved dates', () => {
    const equipmentId = 10;

    service.getReservedDates(equipmentId).subscribe(res => {
      expect(res).toEqual(dummyReservedDates);
    });

    const req = httpMock.expectOne(`http://localhost:8088/campConnect/rental/reserved-dates/${equipmentId}`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyReservedDates);
  });

  it('should delete rental', () => {
    const id = 1;

    service.deleteRental(id).subscribe(res => {
      expect(res).toBeNull();
    });

    const req = httpMock.expectOne(`http://localhost:8088/campConnect/rental/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should update rental', () => {
    const id = 1;
    const dto: RentalRequest = { equipmentId: 10, startDate: '2026-04-02', endDate: '2026-04-06' };

    service.updateRental(id, dto).subscribe(res => {
      expect(res).toEqual(dummyRentalResponse);
    });

    const req = httpMock.expectOne(`http://localhost:8088/campConnect/rental/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(dto);
    req.flush(dummyRentalResponse);
  });
});