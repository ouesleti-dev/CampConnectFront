import { Component, OnInit } from '@angular/core';
import { EquipmentService } from '../../../../shared/services/equipment.service';
import { ReviewService } from '../../../../shared/services/review.service';
import { StoryService } from '../../../../shared/services/Story.service';
import { EquipmentResponse } from '../../../../shared/models/equipment.model';
import { ReviewResponse } from '../../../../shared/models/review.model';
import { StoryResponse } from '../../../../shared/models/story.model';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-rent-list',
  templateUrl: './rent-list.component.html',
  styleUrl: './rent-list.component.css'
})
export class RentListComponent implements OnInit {

  equipments: EquipmentResponse[] = [];
  isLoading = true;

  // ── Review ───────────────────────────────────────────────
  showReviewForm:  { [key: number]: boolean }          = {};
  reviews:         { [key: number]: ReviewResponse[] } = {};
  reviewRating:    { [key: number]: number }           = {};
  reviewComment:   { [key: number]: string }           = {};
  reviewSuccess:   { [key: number]: string }           = {};
  reviewError:     { [key: number]: string }           = {};
  showReviews:     { [key: number]: boolean }          = {};
  hoverRating:     { [key: number]: number }           = {};
  isEditMode:      { [key: number]: boolean }          = {};
  editingReviewId: { [key: number]: number | null }    = {};

  currentUserEmail: string | null = null;

  // ── Promo ────────────────────────────────────────────────
  showPromoForm: { [key: number]: boolean }              = {};
  promoCode:     { [key: number]: string }               = {};
  promoResult:   { [key: number]: StoryResponse | null } = {};
  promoError:    { [key: number]: string }               = {};
  promoLoading:  { [key: number]: boolean }              = {};

  constructor(
    private equipmentService: EquipmentService,
    private reviewService:    ReviewService,
    private storyService:     StoryService,
    private authService:      AuthService
  ) {}

  // ── Clé localStorage unique par utilisateur + équipement ─
  private promoKey(equipmentId: number): string {
    return `promo_${this.currentUserEmail ?? 'guest'}_${equipmentId}`;
  }

  ngOnInit(): void {
    this.currentUserEmail = this.authService.getEmail();
    this.equipmentService.getVerifiedEquipments().subscribe({
      next: (data) => {
        this.equipments = data;
        this.isLoading  = false;
        data.forEach(eq => {
          // ── review init ──
          this.reviewRating[eq.idEquipement]    = 0;
          this.reviewComment[eq.idEquipement]   = '';
          this.isEditMode[eq.idEquipement]       = false;
          this.editingReviewId[eq.idEquipement] = null;

          // ── promo init ──
          this.promoCode[eq.idEquipement]    = '';
          this.promoError[eq.idEquipement]   = '';
          this.promoLoading[eq.idEquipement] = false;

          // Recharger la promo depuis localStorage
          // La clé est préfixée par l'email → isolation par utilisateur
          const key   = this.promoKey(eq.idEquipement);
          const saved = localStorage.getItem(key);

          if (saved) {
            try {
              const parsed: StoryResponse = JSON.parse(saved);
              if (parsed.minutesRemaining > 0) {
                // Promo encore valide → restaurer
                this.promoResult[eq.idEquipement]   = parsed;
                this.showPromoForm[eq.idEquipement] = false;
              } else {
                // Promo expirée → nettoyer
                localStorage.removeItem(key);
                this.promoResult[eq.idEquipement] = null;
              }
            } catch {
              localStorage.removeItem(key);
              this.promoResult[eq.idEquipement] = null;
            }
          } else {
            this.promoResult[eq.idEquipement] = null;
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  // ── Review methods ───────────────────────────────────────
  toggleReviewForm(equipmentId: number): void {
    if (this.showReviewForm[equipmentId]) {
      this.showReviewForm[equipmentId]  = false;
      this.isEditMode[equipmentId]       = false;
      this.editingReviewId[equipmentId] = null;
      this.reviewRating[equipmentId]    = 0;
      this.reviewComment[equipmentId]   = '';
      this.reviewError[equipmentId]     = '';
      this.reviewSuccess[equipmentId]   = '';
    } else {
      this.showReviewForm[equipmentId]  = true;
      this.isEditMode[equipmentId]       = false;
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
      next:  (data) => this.reviews[equipmentId] = data,
      error: ()     => this.reviews[equipmentId] = []
    });
  }

  editReview(review: ReviewResponse, equipmentId: number): void {
    this.isEditMode[equipmentId]       = true;
    this.editingReviewId[equipmentId] = review.idreview;
    this.showReviewForm[equipmentId]  = true;
    this.reviewRating[equipmentId]    = review.rating;
    this.reviewComment[equipmentId]   = review.comment;
    this.reviewError[equipmentId]     = '';
    this.reviewSuccess[equipmentId]   = '';
  }

  submitReview(equipmentId: number): void {
    const rating  = this.reviewRating[equipmentId];
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
          this.reviewError[equipmentId]   = '';
          this.reloadReviews(equipmentId);
          this.resetReviewForm(equipmentId);
        },
        error: () => { this.reviewError[equipmentId] = 'Failed to update review.'; }
      });
    } else {
      this.reviewService.addReview(equipmentId, { rating, comment }).subscribe({
        next: () => {
          this.reviewSuccess[equipmentId] = 'Review submitted successfully!';
          this.reviewError[equipmentId]   = '';
          this.reloadReviews(equipmentId);
          this.resetReviewForm(equipmentId);
        },
        error: () => {
          this.reviewError[equipmentId] =
            'You already reviewed this. Use ✏️ Edit on your review.';
        }
      });
    }
  }

  resetReviewForm(equipmentId: number): void {
    this.reviewRating[equipmentId]    = 0;
    this.reviewComment[equipmentId]   = '';
    this.isEditMode[equipmentId]       = false;
    this.editingReviewId[equipmentId] = null;
    setTimeout(() => {
      this.showReviewForm[equipmentId] = false;
      this.reviewSuccess[equipmentId]  = '';
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

  setHover(equipmentId: number, star: number): void  { this.hoverRating[equipmentId] = star; }
  clearHover(equipmentId: number): void               { this.hoverRating[equipmentId] = 0; }
  setRating(equipmentId: number, star: number): void  { this.reviewRating[equipmentId] = star; }

  getStarClass(equipmentId: number, star: number): string {
    const hover  = this.hoverRating[equipmentId]  || 0;
    const rating = this.reviewRating[equipmentId] || 0;
    return star <= (hover || rating) ? 'star filled' : 'star empty';
  }

  isLoggedIn(): boolean { return this.authService.isLoggedIn(); }

  // ── Promo methods ────────────────────────────────────────
  togglePromoForm(equipmentId: number): void {
    this.showPromoForm[equipmentId] = !this.showPromoForm[equipmentId];
    this.promoCode[equipmentId]     = '';
    this.promoError[equipmentId]    = '';

    // Si on ferme → reset prix + nettoyage localStorage (clé par utilisateur)
    if (!this.showPromoForm[equipmentId]) {
      this.promoResult[equipmentId] = null;
      localStorage.removeItem(this.promoKey(equipmentId));
    }
  }

  applyPromo(equipmentId: number): void {
    const code = this.promoCode[equipmentId]?.trim().toUpperCase();
    if (!code) {
      this.promoError[equipmentId] = 'Veuillez entrer un code promo.';
      return;
    }
    this.promoLoading[equipmentId] = true;
    this.promoError[equipmentId]   = '';
    this.promoResult[equipmentId]  = null;

    this.storyService.applyPromoCode(equipmentId, code).subscribe({
      next: (result) => {
        this.promoResult[equipmentId]  = result;
        this.promoLoading[equipmentId] = false;
        // Sauvegarder avec clé unique par utilisateur
        localStorage.setItem(this.promoKey(equipmentId), JSON.stringify(result));
      },
      error: (err) => {
        this.promoLoading[equipmentId] = false;
        this.promoError[equipmentId]   =
          err?.error?.message || 'Code promo invalide ou expiré.';
      }
    });
  }

  formatMinutes(minutes: number): string {
    if (!minutes || minutes <= 0) return 'Expiré';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m} min`;
  }
}