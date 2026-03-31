import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TransportAdService } from './transport-ad.service';
import { TransportAdRequest, TransportAdResponse } from '../models/transport-ad.model';

describe('TransportAdService', () => {
  let service: TransportAdService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:8088/campConnect/transport-ads';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(TransportAdService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create ad', () => {
    const adRequest: TransportAdRequest = {
      price: 25,
      availableSeats: 3,
      transportType: 'Ride_sharing',
      tripId: 1
    };

    const mockResponse: TransportAdResponse = {
      adId: 1,
      price: 25,
      availableSeats: 3,
      transportType: 'Ride_sharing',
      tripId: 1,
      departureLocation: 'Tunis',
      destination: 'Sousse',
      vehicleLicensePlate: 'TUN-001'
    };

    service.createAd(adRequest).subscribe((res: TransportAdResponse) => {
      expect(res.adId).toBe(1);
      expect(res.price).toBe(25);
      expect(res.destination).toBe('Sousse');
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(adRequest);
    req.flush(mockResponse);
  });

  it('should update ad', () => {
    const adId = 1;

    const adRequest: TransportAdRequest = {
      price: 30,
      availableSeats: 2,
      transportType: 'Ride_sharing',
      tripId: 1
    };

    const mockResponse: TransportAdResponse = {
      adId: 1,
      price: 30,
      availableSeats: 2,
      transportType: 'Ride_sharing',
      tripId: 1,
      departureLocation: 'Tunis',
      destination: 'Sfax',
      vehicleLicensePlate: 'TUN-001'
    };

    service.updateAd(adId, adRequest).subscribe((res: TransportAdResponse) => {
      expect(res.adId).toBe(1);
      expect(res.price).toBe(30);
      expect(res.availableSeats).toBe(2);
    });

    const req = httpMock.expectOne(`${baseUrl}/${adId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(adRequest);
    req.flush(mockResponse);
  });

  it('should delete ad', () => {
    const adId = 1;
    const mockResponse = 'Annonce supprimee avec succes';

    service.deleteAd(adId).subscribe((res: string) => {
      expect(res).toBe('Annonce supprimee avec succes');
    });

    const req = httpMock.expectOne(`${baseUrl}/${adId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  it('should get ad by id', () => {
    const adId = 1;

    const mockResponse: TransportAdResponse = {
      adId: 1,
      price: 25,
      availableSeats: 3,
      transportType: 'Ride_sharing',
      tripId: 1,
      departureLocation: 'Tunis',
      destination: 'Sousse',
      vehicleLicensePlate: 'TUN-001'
    };

    service.getAdById(adId).subscribe((res: TransportAdResponse) => {
      expect(res.adId).toBe(1);
      expect(res.tripId).toBe(1);
      expect(res.vehicleLicensePlate).toBe('TUN-001');
    });

    const req = httpMock.expectOne(`${baseUrl}/${adId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get all ads', () => {
    const mockResponse: TransportAdResponse[] = [
      {
        adId: 1,
        price: 25,
        availableSeats: 3,
        transportType: 'Ride_sharing',
        tripId: 1,
        departureLocation: 'Tunis',
        destination: 'Sousse',
        vehicleLicensePlate: 'TUN-001'
      },
      {
        adId: 2,
        price: 40,
        availableSeats: 4,
        transportType: 'Transport',
        tripId: 2,
        departureLocation: 'Sfax',
        destination: 'Gabes',
        vehicleLicensePlate: 'TUN-002'
      }
    ];

    service.getAllAds().subscribe((res: TransportAdResponse[]) => {
      expect(res.length).toBe(2);
      expect(res[0].price).toBe(25);
      expect(res[1].destination).toBe('Gabes');
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get ads by trip id', () => {
    const tripId = 1;

    const mockResponse: TransportAdResponse[] = [
      {
        adId: 1,
        price: 25,
        availableSeats: 3,
        transportType: 'Ride_sharing',
        tripId: 1,
        departureLocation: 'Tunis',
        destination: 'Sousse',
        vehicleLicensePlate: 'TUN-001'
      }
    ];

    service.getByTripId(tripId).subscribe((res: TransportAdResponse[]) => {
      expect(res.length).toBe(1);
      expect(res[0].tripId).toBe(1);
      expect(res[0].departureLocation).toBe('Tunis');
    });

    const req = httpMock.expectOne(`${baseUrl}/trip/${tripId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});