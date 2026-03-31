// src/app/frontoffice/shared/services/review.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReviewService } from './review.service';
import { ReviewRequest, ReviewResponse } from '../models/review.model';

describe('ReviewService', () => {
  let service: ReviewService;
  let httpMock: HttpTestingController;

  const dummyReviewResponse: ReviewResponse = {
    idreview: 1,
    rating: 5,
    comment: 'Excellent équipement',
    userEmail: 'user@example.com',
    equipmentId: 10
  };

  const dummyReviewArray: ReviewResponse[] = [
    dummyReviewResponse,
    {
      idreview: 2,
      rating: 3,
      comment: 'Correct',
      userEmail: 'ali@example.com',
      equipmentId: 10
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReviewService]
    });

    service = TestBed.inject(ReviewService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a review', () => {
    const dto: ReviewRequest = { rating: 5, comment: 'Excellent équipement' };
    const equipmentId = 10;

    service.addReview(equipmentId, dto).subscribe(res => {
      expect(res).toEqual(dummyReviewResponse);
    });

    const req = httpMock.expectOne(`http://localhost:8088/campConnect/review/equipment/${equipmentId}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(dummyReviewResponse);
  });

  it('should get reviews by equipment', () => {
    const equipmentId = 10;

    service.getReviewsByEquipment(equipmentId).subscribe(res => {
      expect(res.length).toBe(2);
      expect(res).toEqual(dummyReviewArray);
    });

    const req = httpMock.expectOne(`http://localhost:8088/campConnect/review/equipment/${equipmentId}`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyReviewArray);
  });

  it('should update a review', () => {
    const reviewId = 1;
    const dto: ReviewRequest = { rating: 4, comment: 'Bien mais peut mieux faire' };

    service.updateReview(reviewId, dto).subscribe(res => {
      expect(res).toEqual(dummyReviewResponse);
    });

    const req = httpMock.expectOne(`http://localhost:8088/campConnect/review/${reviewId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(dto);
    req.flush(dummyReviewResponse);
  });

  it('should delete a review', () => {
    const reviewId = 1;

    service.deleteReview(reviewId).subscribe(res => {
      expect(res).toBeNull();
    });

    const req = httpMock.expectOne(`http://localhost:8088/campConnect/review/${reviewId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});