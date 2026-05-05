export interface ProductReviewRequest {
  productId: number;
  rating: number;
  comment: string;
}

export interface ProductReviewResponse {
  idProductReview: number;
  rating: number;
  comment: string;
  reviewDate: string;
  reviewerName: string;
  reviewerId: number;
}
