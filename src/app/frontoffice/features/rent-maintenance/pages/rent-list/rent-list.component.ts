import { Component, OnInit } from '@angular/core';
import { EquipmentService } from '../../../../shared/services/equipment.service';
import { ReviewService } from '../../../../shared/services/review.service';
import { EquipmentResponse } from '../../../../shared/models/equipment.model';
import { ReviewResponse } from '../../../../shared/models/review.model';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-rent-list',
  templateUrl: './rent-list.component.html',
  styleUrl: './rent-list.component.css'
})
export class RentListComponent implements OnInit {

  equipments: EquipmentResponse[] = [];
  isLoading = true;

  showReviewForm: { [key: number]: boolean } = {};
  reviews: { [key: number]: ReviewResponse[] } = {};
  reviewRating: { [key: number]: number } = {};
  reviewComment: { [key: number]: string } = {};
  reviewSuccess: { [key: number]: string } = {};
  reviewError: { [key: number]: string } = {};
  showReviews: { [key: number]: boolean } = {};
  hoverRating: { [key: number]: number } = {};
  isEditMode: { [key: number]: boolean } = {};
  editingReviewId: { [key: number]: number | null } = {};

  currentUserEmail: string | null = null;

  constructor(
    private equipmentService: EquipmentService,
    private reviewService: ReviewService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserEmail = this.authService.getEmail();
    this.equipmentService.getVerifiedEquipments().subscribe({
      next: (data) => {
        this.equipments = data;
        this.isLoading = false;
        data.forEach(eq => {
          this.reviewRating[eq.idEquipement] = 0;
          this.reviewComment[eq.idEquipement] = '';
          this.isEditMode[eq.idEquipement] = false;
          this.editingReviewId[eq.idEquipement] = null;
        });
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  toggleReviewForm(equipmentId: number): void {
    if (this.showReviewForm[equipmentId]) {
      this.showReviewForm[equipmentId] = false;
      this.isEditMode[equipmentId] = false;
      this.editingReviewId[equipmentId] = null;
      this.reviewRating[equipmentId] = 0;
      this.reviewComment[equipmentId] = '';
      this.reviewError[equipmentId] = '';
      this.reviewSuccess[equipmentId] = '';
    } else {
      this.showReviewForm[equipmentId] = true;
      this.isEditMode[equipmentId] = false;
      this.editingReviewId[equipmentId] = null;
    }
  }

  loadReviews(equipmentId: number): void {
    this.showReviews[equipmentId] = !this.showReviews[equipmentId];
    if (this.showReviews[equipmentId]) {
      this.reloadReviews(equipmentId);
    }
  }

  reloadReviews(equipmentId: number): void {
    this.reviewService.getReviewsByEquipment(equipmentId).subscribe({
      next: (data) => this.reviews[equipmentId] = data,
      error: () => this.reviews[equipmentId] = []
    });
  }

  editReview(review: ReviewResponse, equipmentId: number): void {
    this.isEditMode[equipmentId] = true;
    this.editingReviewId[equipmentId] = review.idreview;
    this.showReviewForm[equipmentId] = true;
    this.reviewRating[equipmentId] = review.rating;
    this.reviewComment[equipmentId] = review.comment;
    this.reviewError[equipmentId] = '';
    this.reviewSuccess[equipmentId] = '';
  }

  submitReview(equipmentId: number): void {
    const rating = this.reviewRating[equipmentId];
    const comment = this.reviewComment[equipmentId];

    if (!rating || rating < 1 || rating > 5) {
      this.reviewError[equipmentId] = 'Please select a rating (1-5 stars).';
      return;
    }
    if (!comment.trim()) {
      this.reviewError[equipmentId] = 'Please write a comment.';
      return;
    }

    if (this.isEditMode[equipmentId] && this.editingReviewId[equipmentId]) {
      this.reviewService.updateReview(this.editingReviewId[equipmentId]!, { rating, comment }).subscribe({
        next: () => {
          this.reviewSuccess[equipmentId] = 'Review updated successfully!';
          this.reviewError[equipmentId] = '';
          this.reloadReviews(equipmentId);
          this.resetReviewForm(equipmentId);
        },
        error: () => {
          this.reviewError[equipmentId] = 'Failed to update review.';
        }
      });
    } else {
      this.reviewService.addReview(equipmentId, { rating, comment }).subscribe({
        next: () => {
          this.reviewSuccess[equipmentId] = 'Review submitted successfully!';
          this.reviewError[equipmentId] = '';
          this.reloadReviews(equipmentId);
          this.resetReviewForm(equipmentId);
        },
        error: () => {
          this.reviewError[equipmentId] = 'You already reviewed this. Use ✏️ Edit on your review.';
        }
      });
    }
  }

  resetReviewForm(equipmentId: number): void {
    this.reviewRating[equipmentId] = 0;
    this.reviewComment[equipmentId] = '';
    this.isEditMode[equipmentId] = false;
    this.editingReviewId[equipmentId] = null;
    setTimeout(() => {
      this.showReviewForm[equipmentId] = false;
      this.reviewSuccess[equipmentId] = '';
    }, 1500);
  }

  deleteReview(reviewId: number, equipmentId: number): void {
    if (!confirm('Delete this review?')) return;
    this.reviewService.deleteReview(reviewId).subscribe({
      next: () => {
        this.reviews[equipmentId] = this.reviews[equipmentId]
          .filter(r => r.idreview !== reviewId);
      }
    });
  }

  setHover(equipmentId: number, star: number): void {
    this.hoverRating[equipmentId] = star;
  }

  clearHover(equipmentId: number): void {
    this.hoverRating[equipmentId] = 0;
  }

  setRating(equipmentId: number, star: number): void {
    this.reviewRating[equipmentId] = star;
  }

  getStarClass(equipmentId: number, star: number): string {
    const hover = this.hoverRating[equipmentId] || 0;
    const rating = this.reviewRating[equipmentId] || 0;
    return star <= (hover || rating) ? 'star filled' : 'star empty';
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
