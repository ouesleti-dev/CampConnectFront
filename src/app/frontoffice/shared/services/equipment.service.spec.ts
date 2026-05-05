// src/app/frontoffice/shared/services/equipment.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EquipmentService } from './equipment.service';
import { EquipmentRequest, EquipmentResponse } from '../models/equipment.model';

describe('EquipmentService', () => {
  let service: EquipmentService;
  let httpMock: HttpTestingController;

  const dummyEquipmentResponse: EquipmentResponse = {
    idEquipement: 1,
    name: 'Tente',
    type: 'TENTS',
    description: 'Tente de camping',
    owner: 'Mohamed',
    aviability: 'Reserve',
    verified: true,
    state: 'Reserve',
    price: 100,
    picture: 'tente.jpg'
  };

  const dummyEquipmentArray: EquipmentResponse[] = [
    { idEquipement: 1, name: 'Tente', type: 'TENTS', description: 'Tente de camping', owner: 'Mohamed', aviability: 'Reserve', verified: true, state: 'Reserve', price: 100, picture: 'tente.jpg' },
    { idEquipement: 2, name: 'Sac à dos', type: 'BACKPACKS', description: 'Sac léger', owner: 'Ali', aviability: 'Not_Reserve', verified: false, state: 'Not_Reserve', price: 50, picture: 'sac.jpg' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EquipmentService]
    });

    service = TestBed.inject(EquipmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create equipment', () => {
    const dto: EquipmentRequest = {
      name: 'Tente',
      type: 'TENTS',
      description: 'Tente de camping',
      aviability: 'Reserve',
      state: 'Reserve',
      price: 100,
      picture: 'tente.jpg'
    };

    service.createEquipment(dto).subscribe(res => {
      expect(res).toEqual(dummyEquipmentResponse);
    });

    const req = httpMock.expectOne('http://localhost:8088/campConnect/equipment');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(dummyEquipmentResponse);
  });

  it('should get my equipments', () => {
    service.getMyEquipments().subscribe(res => {
      expect(res.length).toBe(2);
      expect(res).toEqual(dummyEquipmentArray);
    });

    const req = httpMock.expectOne('http://localhost:8088/campConnect/equipment/my');
    expect(req.request.method).toBe('GET');
    req.flush(dummyEquipmentArray);
  });

  it('should get verified equipments', () => {
    service.getVerifiedEquipments().subscribe(res => {
      expect(res).toEqual([dummyEquipmentArray[0]]);
    });

    const req = httpMock.expectOne('http://localhost:8088/campConnect/equipment/verified');
    expect(req.request.method).toBe('GET');
    req.flush([dummyEquipmentArray[0]]);
  });

  it('should get unverified equipments', () => {
    service.getUnverifiedEquipments().subscribe(res => {
      expect(res).toEqual([dummyEquipmentArray[1]]);
    });

    const req = httpMock.expectOne('http://localhost:8088/campConnect/equipment/unverified');
    expect(req.request.method).toBe('GET');
    req.flush([dummyEquipmentArray[1]]);
  });

  it('should verify equipment', () => {
    const id = 1;

    service.verifyEquipment(id).subscribe(res => {
      expect(res).toEqual(dummyEquipmentResponse);
    });

    const req = httpMock.expectOne(`http://localhost:8088/campConnect/equipment/verify/${id}`);
    expect(req.request.method).toBe('PUT');
    req.flush(dummyEquipmentResponse);
  });

  it('should delete equipment', () => {
    const id = 1;

    service.deleteEquipment(id).subscribe(res => {
      expect(res).toBeNull();
    });

    const req = httpMock.expectOne(`http://localhost:8088/campConnect/equipment/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should update equipment', () => {
    const id = 1;
    const dto: EquipmentRequest = {
      name: 'Nouvelle tente',
      type: 'TENTS',
      description: 'Tente modifiée',
      aviability: 'Reserve',
      state: 'Reserve',
      price: 120,
      picture: 'tente_modifiee.jpg'
    };

    service.updateEquipment(id, dto).subscribe(res => {
      expect(res).toEqual(dummyEquipmentResponse);
    });

    const req = httpMock.expectOne(`http://localhost:8088/campConnect/equipment/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(dto);
    req.flush(dummyEquipmentResponse);
  });
});