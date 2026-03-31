import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { VehicleService } from './vehicle.service';
import { VehicleRequest, VehicleResponse } from '../models/vehicle.model';

describe('VehicleService', () => {
  let service: VehicleService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:8088/campConnect/vehicles';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(VehicleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get all vehicles', () => {
    const mockResponse: VehicleResponse[] = [
      {
        vehicleId: 1,
        licensePlate: 'TUN-001',
        vehicleType: 'Car',
        capacity: 5,
        status: 'active',
        ownerId: 10,
        ownerEmail: 'test@mail.com'
      },
      {
        vehicleId: 2,
        licensePlate: 'TUN-002',
        vehicleType: 'Bus',
        capacity: 20,
        status: 'inactive',
        ownerId: 11,
        ownerEmail: 'user@mail.com'
      }
    ];

    service.getAllVehicles().subscribe((res: VehicleResponse[]) => {
      expect(res.length).toBe(2);
      expect(res[0].licensePlate).toBe('TUN-001');
      expect(res[1].vehicleType).toBe('Bus');
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should add vehicle', () => {
    const vehicleRequest: VehicleRequest = {
      licensePlate: 'TUN-003',
      vehicleType: 'Van',
      capacity: 8,
      status: 'active'
    };

    const mockResponse: VehicleResponse = {
      vehicleId: 3,
      licensePlate: 'TUN-003',
      vehicleType: 'Van',
      capacity: 8,
      status: 'active',
      ownerId: 12,
      ownerEmail: 'owner@mail.com'
    };

    service.addVehicle(vehicleRequest).subscribe((res: VehicleResponse) => {
      expect(res.vehicleId).toBe(3);
      expect(res.licensePlate).toBe('TUN-003');
      expect(res.ownerEmail).toBe('owner@mail.com');
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(vehicleRequest);
    req.flush(mockResponse);
  });

  it('should update vehicle', () => {
    const vehicleId = 1;

    const vehicleRequest: VehicleRequest = {
      licensePlate: 'TUN-009',
      vehicleType: 'Car',
      capacity: 4,
      status: 'inactive'
    };

    const mockResponse: VehicleResponse = {
      vehicleId: 1,
      licensePlate: 'TUN-009',
      vehicleType: 'Car',
      capacity: 4,
      status: 'inactive',
      ownerId: 10,
      ownerEmail: 'test@mail.com'
    };

    service.updateVehicle(vehicleId, vehicleRequest).subscribe((res: VehicleResponse) => {
      expect(res.vehicleId).toBe(1);
      expect(res.licensePlate).toBe('TUN-009');
      expect(res.status).toBe('inactive');
    });

    const req = httpMock.expectOne(`${baseUrl}/${vehicleId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(vehicleRequest);
    req.flush(mockResponse);
  });

  it('should delete vehicle', () => {
    const vehicleId = 1;
    const mockResponse = 'Vehicule supprime avec succes';

    service.deleteVehicle(vehicleId).subscribe((res: string) => {
      expect(res).toBe('Vehicule supprime avec succes');
    });

    const req = httpMock.expectOne(`${baseUrl}/${vehicleId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });
});