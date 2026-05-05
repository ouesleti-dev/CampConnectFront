// src/app/frontoffice/shared/models/review.model.ts

export interface ReviewRequest {
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  idreview: number;
  rating: number;
  comment: string;
  userEmail: string;
  equipmentId: number;
}
