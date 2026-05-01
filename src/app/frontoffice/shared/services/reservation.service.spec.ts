import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReservationService } from './reservation.service';
import {
  ReservationDetailsResponse,
  ReservationRequest,
  ReservationResponse
} from '../models/reservation.model';

describe('ReservationService', () => {
  let service: ReservationService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:8088/campConnect/reservations';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(ReservationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create reservation', () => {
    const reservationRequest: ReservationRequest = {
      reservationDate: '2026-04-01',
      seatCount: 2,
      status: 'CONFIRMED',
      transportAdId: 1
    };

    const mockResponse: ReservationResponse = {
      reservationId: 1,
      reservationDate: '2026-04-01',
      seatCount: 2,
      status: 'CONFIRMED',
      transportAdId: 1,
      adPrice: 25,
      departureLocation: 'Tunis',
      destination: 'Sousse',
      userEmail: 'test@mail.com'
    };

    service.createReservation(reservationRequest).subscribe((res: ReservationResponse) => {
      expect(res.reservationId).toBe(1);
      expect(res.seatCount).toBe(2);
      expect(res.status).toBe('CONFIRMED');
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(reservationRequest);
    req.flush(mockResponse);
  });

  it('should update reservation', () => {
    const reservationId = 1;

    const reservationRequest: ReservationRequest = {
      reservationDate: '2026-04-02',
      seatCount: 3,
      status: 'UPDATED',
      transportAdId: 1
    };

    const mockResponse: ReservationResponse = {
      reservationId: 1,
      reservationDate: '2026-04-02',
      seatCount: 3,
      status: 'UPDATED',
      transportAdId: 1,
      adPrice: 30,
      departureLocation: 'Tunis',
      destination: 'Sfax',
      userEmail: 'test@mail.com'
    };

    service.updateReservation(reservationId, reservationRequest).subscribe((res: ReservationResponse) => {
      expect(res.reservationId).toBe(1);
      expect(res.seatCount).toBe(3);
      expect(res.status).toBe('UPDATED');
    });

    const req = httpMock.expectOne(`${baseUrl}/${reservationId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(reservationRequest);
    req.flush(mockResponse);
  });

  it('should delete reservation', () => {
    const reservationId = 1;
    const mockResponse = 'Reservation supprimee avec succes';

    service.deleteReservation(reservationId).subscribe((res: string) => {
      expect(res).toBe('Reservation supprimee avec succes');
    });

    const req = httpMock.expectOne(`${baseUrl}/${reservationId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  it('should get reservation by id', () => {
    const reservationId = 1;

    const mockResponse: ReservationResponse = {
      reservationId: 1,
      reservationDate: '2026-04-01',
      seatCount: 2,
      status: 'CONFIRMED',
      transportAdId: 1,
      adPrice: 25,
      departureLocation: 'Tunis',
      destination: 'Sousse',
      userEmail: 'test@mail.com'
    };

    service.getReservationById(reservationId).subscribe((res: ReservationResponse) => {
      expect(res.reservationId).toBe(1);
      expect(res.transportAdId).toBe(1);
      expect(res.userEmail).toBe('test@mail.com');
    });

    const req = httpMock.expectOne(`${baseUrl}/${reservationId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get all reservations', () => {
    const mockResponse: ReservationResponse[] = [
      {
        reservationId: 1,
        reservationDate: '2026-04-01',
        seatCount: 2,
        status: 'CONFIRMED',
        transportAdId: 1,
        adPrice: 25,
        departureLocation: 'Tunis',
        destination: 'Sousse',
        userEmail: 'test@mail.com'
      },
      {
        reservationId: 2,
        reservationDate: '2026-04-02',
        seatCount: 1,
        status: 'PENDING',
        transportAdId: 2,
        adPrice: 40,
        departureLocation: 'Sfax',
        destination: 'Gabes',
        userEmail: 'user@mail.com'
      }
    ];

    service.getAllReservations().subscribe((res: ReservationResponse[]) => {
      expect(res.length).toBe(2);
      expect(res[0].status).toBe('CONFIRMED');
      expect(res[1].destination).toBe('Gabes');
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get my reservations', () => {
    const mockResponse: ReservationResponse[] = [
      {
        reservationId: 1,
        reservationDate: '2026-04-01',
        seatCount: 2,
        status: 'CONFIRMED',
        transportAdId: 1,
        adPrice: 25,
        departureLocation: 'Tunis',
        destination: 'Sousse',
        userEmail: 'test@mail.com'
      }
    ];

    service.getMyReservations().subscribe((res: ReservationResponse[]) => {
      expect(res.length).toBe(1);
      expect(res[0].userEmail).toBe('test@mail.com');
      expect(res[0].seatCount).toBe(2);
    });

    const req = httpMock.expectOne(`${baseUrl}/my`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get reservations by ad id', () => {
    const adId = 1;

    const mockResponse: ReservationResponse[] = [
      {
        reservationId: 1,
        reservationDate: '2026-04-01',
        seatCount: 2,
        status: 'CONFIRMED',
        transportAdId: 1,
        adPrice: 25,
        departureLocation: 'Tunis',
        destination: 'Sousse',
        userEmail: 'test@mail.com'
      }
    ];

    service.getByAdId(adId).subscribe((res: ReservationResponse[]) => {
      expect(res.length).toBe(1);
      expect(res[0].transportAdId).toBe(1);
      expect(res[0].departureLocation).toBe('Tunis');
    });

    const req = httpMock.expectOne(`${baseUrl}/ad/${adId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get reservation details', () => {
    const mockResponse: ReservationDetailsResponse[] = [
      {
        reservationId: 1,
        destination: 'Sousse',
        price: 25,
        vehicle: 'Bus AB-123-CD',
        seats: 2,
        status: 'CONFIRMED'
      }
    ];

    service.getReservationDetails().subscribe((res: ReservationDetailsResponse[]) => {
      expect(res.length).toBe(1);
      expect(res[0].destination).toBe('Sousse');
      expect(res[0].vehicle).toContain('Bus');
    });

    const req = httpMock.expectOne(`${baseUrl}/details`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should search reservation details with destination and transport type', () => {
    const mockResponse: ReservationDetailsResponse[] = [
      {
        reservationId: 2,
        destination: 'Gabes',
        price: 40,
        vehicle: 'Van XY-456-ZT',
        seats: 1,
        status: 'PENDING'
      }
    ];

    service.searchReservations('Gabes', 'Ride_sharing').subscribe((res: ReservationDetailsResponse[]) => {
      expect(res.length).toBe(1);
      expect(res[0].reservationId).toBe(2);
      expect(res[0].status).toBe('PENDING');
    });

    const req = httpMock.expectOne(
      `${baseUrl}/search?destination=Gabes&transportType=Ride_sharing`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
