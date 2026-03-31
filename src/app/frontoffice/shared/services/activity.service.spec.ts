import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivityService } from './activity.service';
import { ApiService } from './api.service';
import { ActivityDTO } from '../models/camping-forum.models';

describe('ActivityService', () => {
  let service: ActivityService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ActivityService, ApiService]
    });
    service = TestBed.inject(ActivityService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('doit récupérer les activités par Event (getByEvent)', () => {
    const mockActivities: ActivityDTO[] = [
      { id: 1, name: 'Randonnée', description: 'Test', duration: 2, difficulty: 'EASY', eventId: 10, eventTitle: 'Event Test', campingId: 1, campingName: 'Camp 1', totalParticipations: 5 }
    ];

    service.getByEvent(10).subscribe(data => {
      expect(data.length).toBe(1);
      expect(data[0].name).toBe('Randonnée');
    });

    // On vérifie l'URL construite par l'ApiService
    const req = httpMock.expectOne('http://localhost:8088/campConnect/activities/event/10');
    expect(req.request.method).toBe('GET');
    req.flush(mockActivities);
  });

  it('doit créer une activité (create)', () => {
    const newAct = { name: 'VTT', eventId: 10 };
    const mockRes = { id: 50, name: 'VTT' } as any;

    service.create(newAct).subscribe(res => {
      expect(res.id).toBe(50);
    });

    const req = httpMock.expectOne('http://localhost:8088/campConnect/activities');
    expect(req.request.method).toBe('POST');
    req.flush(mockRes);
  });
});