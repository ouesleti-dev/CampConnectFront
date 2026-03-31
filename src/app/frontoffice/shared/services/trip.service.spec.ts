import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TripService } from './trip.service';
import { TripRequest, TripResponse } from '../models/trip.model';

describe('TripService', () => {
  let service: TripService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:8088/campConnect/trips';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(TripService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create trip', () => {
    const tripRequest: TripRequest = {
      departureLocation: 'Tunis',
      destination: 'Sousse',
      departureDate: '2026-04-01',
      distance: 140,
      vehicleId: 1
    };

    const mockResponse: TripResponse = {
      tripId: 1,
      departureLocation: 'Tunis',
      destination: 'Sousse',
      departureDate: '2026-04-01',
      distance: 140,
      vehicleId: 1,
      vehicleLicensePlate: 'TUN-001',
      vehicleType: 'Car'
    };

    service.createTrip(tripRequest).subscribe((res: TripResponse) => {
      expect(res.tripId).toBe(1);
      expect(res.departureLocation).toBe('Tunis');
      expect(res.destination).toBe('Sousse');
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(tripRequest);
    req.flush(mockResponse);
  });

  it('should update trip', () => {
    const tripId = 1;

    const tripRequest: TripRequest = {
      departureLocation: 'Nabeul',
      destination: 'Monastir',
      departureDate: '2026-04-02',
      distance: 180,
      vehicleId: 1
    };

    const mockResponse: TripResponse = {
      tripId: 1,
      departureLocation: 'Nabeul',
      destination: 'Monastir',
      departureDate: '2026-04-02',
      distance: 180,
      vehicleId: 1,
      vehicleLicensePlate: 'TUN-001',
      vehicleType: 'Car'
    };

    service.updateTrip(tripId, tripRequest).subscribe((res: TripResponse) => {
      expect(res.tripId).toBe(1);
      expect(res.departureLocation).toBe('Nabeul');
      expect(res.destination).toBe('Monastir');
      expect(res.distance).toBe(180);
    });

    const req = httpMock.expectOne(`${baseUrl}/${tripId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(tripRequest);
    req.flush(mockResponse);
  });

  it('should delete trip', () => {
    const tripId = 1;
    const mockResponse = 'Trip supprime avec succes';

    service.deleteTrip(tripId).subscribe((res: string) => {
      expect(res).toBe('Trip supprime avec succes');
    });

    const req = httpMock.expectOne(`${baseUrl}/${tripId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  it('should get trip by id', () => {
    const tripId = 1;

    const mockResponse: TripResponse = {
      tripId: 1,
      departureLocation: 'Tunis',
      destination: 'Sousse',
      departureDate: '2026-04-01',
      distance: 140,
      vehicleId: 1,
      vehicleLicensePlate: 'TUN-001',
      vehicleType: 'Car'
    };

    service.getTripById(tripId).subscribe((res: TripResponse) => {
      expect(res.tripId).toBe(1);
      expect(res.destination).toBe('Sousse');
      expect(res.vehicleLicensePlate).toBe('TUN-001');
    });

    const req = httpMock.expectOne(`${baseUrl}/${tripId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get all trips', () => {
    const mockResponse: TripResponse[] = [
      {
        tripId: 1,
        departureLocation: 'Tunis',
        destination: 'Sousse',
        departureDate: '2026-04-01',
        distance: 140,
        vehicleId: 1,
        vehicleLicensePlate: 'TUN-001',
        vehicleType: 'Car'
      },
      {
        tripId: 2,
        departureLocation: 'Sfax',
        destination: 'Gabes',
        departureDate: '2026-04-03',
        distance: 150,
        vehicleId: 2,
        vehicleLicensePlate: 'TUN-002',
        vehicleType: 'Bus'
      }
    ];

    service.getAllTrips().subscribe((res: TripResponse[]) => {
      expect(res.length).toBe(2);
      expect(res[0].departureLocation).toBe('Tunis');
      expect(res[1].destination).toBe('Gabes');
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get trips by vehicle id', () => {
    const vehicleId = 1;

    const mockResponse: TripResponse[] = [
      {
        tripId: 1,
        departureLocation: 'Tunis',
        destination: 'Sousse',
        departureDate: '2026-04-01',
        distance: 140,
        vehicleId: 1,
        vehicleLicensePlate: 'TUN-001',
        vehicleType: 'Car'
      }
    ];

    service.getTripsByVehicleId(vehicleId).subscribe((res: TripResponse[]) => {
      expect(res.length).toBe(1);
      expect(res[0].vehicleId).toBe(1);
      expect(res[0].vehicleType).toBe('Car');
    });

    const req = httpMock.expectOne(`${baseUrl}/vehicle/${vehicleId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get trips by destination', () => {
    const destination = 'Sousse';

    const mockResponse: TripResponse[] = [
      {
        tripId: 1,
        departureLocation: 'Tunis',
        destination: 'Sousse',
        departureDate: '2026-04-01',
        distance: 140,
        vehicleId: 1,
        vehicleLicensePlate: 'TUN-001',
        vehicleType: 'Car'
      }
    ];

    service.getTripsByDestination(destination).subscribe((res: TripResponse[]) => {
      expect(res.length).toBe(1);
      expect(res[0].destination).toBe('Sousse');
    });

    const req = httpMock.expectOne(`${baseUrl}/destination/${destination}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});