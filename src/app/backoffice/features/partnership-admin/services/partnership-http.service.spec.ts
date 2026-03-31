import { TestBed } from '@angular/core/testing';
import { PartnershipHttpService } from './partnership-http.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { environment } from '../../../../../environments/environment';

describe('PartnershipHttpService', () => {
  let service: PartnershipHttpService;
  let httpMock: HttpTestingController;

  const base = `${environment.apiUrl}/api/partnership`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PartnershipHttpService]
    });

    service = TestBed.inject(PartnershipHttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ===============================
  // ✅ Partner Users
  // ===============================
  it('should get partner users', () => {
    const mockData = [{ id: 1, firstName: 'Ali' }];

    service.getPartnerUsers().subscribe(res => {
      expect(res.length).toBe(1);
      expect(res[0].id).toBe(1);
    });

    const req = httpMock.expectOne(`${base}/partner-users`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should create partner user', () => {
    const body = { firstName: 'Ali' };
    const mockResponse = { id: 1, firstName: 'Ali' };

    service.createPartnerUser(body as any).subscribe(res => {
      expect(res.id).toBe(1);
    });

    const req = httpMock.expectOne(`${base}/partner-users`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(mockResponse);
  });

  it('should update partner user', () => {
    const body = { firstName: 'Updated' };

    service.updatePartnerUser(1, body as any).subscribe();

    const req = httpMock.expectOne(`${base}/partner-users/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('should delete partner user', () => {
    service.deletePartnerUser(1).subscribe();

    const req = httpMock.expectOne(`${base}/partner-users/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // ===============================
  // ✅ Campings
  // ===============================
  it('should get campings', () => {
    service.getCampings().subscribe();

    const req = httpMock.expectOne(`${base}/campings`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should create camping', () => {
    const body = { name: 'Camp' };

    service.createCamping(body).subscribe();

    const req = httpMock.expectOne(`${base}/campings`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });

  // ===============================
  // ✅ Offers
  // ===============================
  it('should get offers', () => {
    service.getOffers().subscribe();

    const req = httpMock.expectOne(`${base}/offers`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should create offer', () => {
    const body = { title: 'Offer' };

    service.createOffer(body).subscribe();

    const req = httpMock.expectOne(`${base}/offers`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  // ===============================
  // ✅ Contrats
  // ===============================
  it('should get contrats', () => {
    service.getContrats().subscribe();

    const req = httpMock.expectOne(`${base}/contrats`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  // ===============================
  // ✅ Interviews
  // ===============================
  it('should get interviews', () => {
    service.getInterviews().subscribe();

    const req = httpMock.expectOne(`${base}/interviews`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  // ===============================
  // ✅ Meetings
  // ===============================
  it('should get meetings', () => {
    service.getMeetings().subscribe();

    const req = httpMock.expectOne(`${base}/meetings`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  // ===============================
  // ✅ Quiz
  // ===============================
  it('should get quizzes', () => {
    service.getQuizzes().subscribe();

    const req = httpMock.expectOne(`${base}/quizzes`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  // ===============================
  // ✅ Questions
  // ===============================
  it('should get questions', () => {
    service.getQuestions().subscribe();

    const req = httpMock.expectOne(`${base}/questions`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  // ===============================
  // ✅ Reponses
  // ===============================
  it('should get reponses', () => {
    service.getReponses().subscribe();

    const req = httpMock.expectOne(`${base}/reponses`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

});