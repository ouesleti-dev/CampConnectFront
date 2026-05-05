import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CampingService } from './camping.service';
import { ApiService } from './api.service';
import { CampingDTO } from '../models/camping-forum.models';

describe('CampingService', () => {
  let service: CampingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CampingService, ApiService] // On injecte les deux
    });
    service = TestBed.inject(CampingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Vérifie qu'il n'y a pas de requêtes HTTP en attente
  });

  it('doit récupérer la liste des campings (getAll)', () => {
    const mockCampings: CampingDTO[] = [
      { campingId: 1, name: 'Camping Les Pins', address: 'Tunis', description: 'Beau', postalCode: '1000', status: 'ACTIVE', totalEvents: 0, totalActivities: 0 }
    ];

    service.getAll().subscribe(campings => {
      expect(campings.length).toBe(1);
      expect(campings[0].name).toBe('Camping Les Pins');
    });

    // Attention : l'URL complète inclut la baseUrl de ton ApiService
    const req = httpMock.expectOne('http://localhost:8088/campConnect/campings');
    expect(req.request.method).toBe('GET');
    req.flush(mockCampings);
  });

  it('doit créer un nouveau camping (create)', () => {
    const newCamping = { name: 'Nouveau Camping', address: 'Bizerte' };
    const mockResponse: CampingDTO = { campingId: 99, name: 'Nouveau Camping', address: 'Bizerte', description: '', postalCode: '', status: 'ACTIVE', totalEvents: 0, totalActivities: 0 } as any;

    service.create(newCamping).subscribe(res => {
      expect(res.campingId).toBe(99);
    });

    const req = httpMock.expectOne('http://localhost:8088/campConnect/campings');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});