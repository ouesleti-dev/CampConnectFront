import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OptionServiceService } from './option-service.service';
import { OptionServiceRequest, OptionServiceResponse } from '../models/option-service.model';

describe('OptionServiceService', () => {
  let service: OptionServiceService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:8088/campConnect/options';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(OptionServiceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create option', () => {
    const optionRequest: OptionServiceRequest = {
      name: 'WiFi',
      optionType: 'Comfort',
      vehicleId: 1
    };

    const mockResponse: OptionServiceResponse = {
      optionId: 1,
      name: 'WiFi',
      optionType: 'Comfort',
      vehicleId: 1,
      vehicleLicensePlate: 'TUN-001',
      vehicleType: 'Car'
    };

    service.createOption(optionRequest).subscribe((res: OptionServiceResponse) => {
      expect(res.optionId).toBe(1);
      expect(res.name).toBe('WiFi');
      expect(res.optionType).toBe('Comfort');
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(optionRequest);
    req.flush(mockResponse);
  });

  it('should update option', () => {
    const optionId = 1;

    const optionRequest: OptionServiceRequest = {
      name: 'Climatisation',
      optionType: 'Premium',
      vehicleId: 1
    };

    const mockResponse: OptionServiceResponse = {
      optionId: 1,
      name: 'Climatisation',
      optionType: 'Premium',
      vehicleId: 1,
      vehicleLicensePlate: 'TUN-001',
      vehicleType: 'Car'
    };

    service.updateOption(optionId, optionRequest).subscribe((res: OptionServiceResponse) => {
      expect(res.optionId).toBe(1);
      expect(res.name).toBe('Climatisation');
      expect(res.optionType).toBe('Premium');
    });

    const req = httpMock.expectOne(`${baseUrl}/${optionId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(optionRequest);
    req.flush(mockResponse);
  });

  it('should delete option', () => {
    const optionId = 1;
    const mockResponse = 'Option supprimee avec succes';

    service.deleteOption(optionId).subscribe((res: string) => {
      expect(res).toBe('Option supprimee avec succes');
    });

    const req = httpMock.expectOne(`${baseUrl}/${optionId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  it('should get option by id', () => {
    const optionId = 1;

    const mockResponse: OptionServiceResponse = {
      optionId: 1,
      name: 'WiFi',
      optionType: 'Comfort',
      vehicleId: 1,
      vehicleLicensePlate: 'TUN-001',
      vehicleType: 'Car'
    };

    service.getOptionById(optionId).subscribe((res: OptionServiceResponse) => {
      expect(res.optionId).toBe(1);
      expect(res.vehicleId).toBe(1);
      expect(res.vehicleLicensePlate).toBe('TUN-001');
    });

    const req = httpMock.expectOne(`${baseUrl}/${optionId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get all options', () => {
    const mockResponse: OptionServiceResponse[] = [
      {
        optionId: 1,
        name: 'WiFi',
        optionType: 'Comfort',
        vehicleId: 1,
        vehicleLicensePlate: 'TUN-001',
        vehicleType: 'Car'
      },
      {
        optionId: 2,
        name: 'USB',
        optionType: 'Basic',
        vehicleId: 2,
        vehicleLicensePlate: 'TUN-002',
        vehicleType: 'Bus'
      }
    ];

    service.getAllOptions().subscribe((res: OptionServiceResponse[]) => {
      expect(res.length).toBe(2);
      expect(res[0].name).toBe('WiFi');
      expect(res[1].vehicleType).toBe('Bus');
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get options by vehicle id', () => {
    const vehicleId = 1;

    const mockResponse: OptionServiceResponse[] = [
      {
        optionId: 1,
        name: 'WiFi',
        optionType: 'Comfort',
        vehicleId: 1,
        vehicleLicensePlate: 'TUN-001',
        vehicleType: 'Car'
      }
    ];

    service.getByVehicleId(vehicleId).subscribe((res: OptionServiceResponse[]) => {
      expect(res.length).toBe(1);
      expect(res[0].vehicleId).toBe(1);
      expect(res[0].name).toBe('WiFi');
    });

    const req = httpMock.expectOne(`${baseUrl}/vehicle/${vehicleId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get options by type', () => {
    const optionType = 'Comfort';

    const mockResponse: OptionServiceResponse[] = [
      {
        optionId: 1,
        name: 'WiFi',
        optionType: 'Comfort',
        vehicleId: 1,
        vehicleLicensePlate: 'TUN-001',
        vehicleType: 'Car'
      }
    ];

    service.getByType(optionType).subscribe((res: OptionServiceResponse[]) => {
      expect(res.length).toBe(1);
      expect(res[0].optionType).toBe('Comfort');
      expect(res[0].vehicleLicensePlate).toBe('TUN-001');
    });

    const req = httpMock.expectOne(`${baseUrl}/type/${optionType}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});