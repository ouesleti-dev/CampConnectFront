import { Component, OnInit, OnDestroy } from '@angular/core';
import { StoryService } from '../../../../shared/services/Story.service';
import { EquipmentService } from '../../../../shared/services/equipment.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { StoryRequest, StoryResponse } from '../../../../shared/models/story.model';
import { EquipmentResponse } from '../../../../shared/models/equipment.model';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-story-bar',
  templateUrl: './story-bar.component.html',
  styleUrls: ['./story-bar.component.css']
})
export class StoryBarComponent implements OnInit, OnDestroy {

  // ── Données ──────────────────────────────────────────────
  stories: StoryResponse[]        = [];
  myEquipments: EquipmentResponse[] = [];
  loading = true;

  // ── Viewer ───────────────────────────────────────────────
  isViewerOpen  = false;
  currentIndex  = 0;
  currentStory: StoryResponse | null = null;
  viewedStories = new Set<number>();
  copied        = false;
  progressWidth = 0;

  // ── Formulaire ───────────────────────────────────────────
  isFormOpen    = false;
  editingStory: StoryResponse | null = null;
  formData: StoryRequest = {
    equipmentId: 0,
    promoCode:   '',
    discount:    20,
    message:     ''
  };
  formError  = '';
  submitting = false;

  // ── Toast ────────────────────────────────────────────────
  toastVisible = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  private subs: Subscription       = new Subscription();
  private progressInterval: any;

  constructor(
    private storyService:     StoryService,
    private equipmentService: EquipmentService,
    private authService:      AuthService
  ) {}

  // ────────────────────────────────────────────────────────
  ngOnInit(): void {
  this.loadStories();
  if (this.authService.isLoggedIn()) {
    this.loadMyEquipments();
  }
    // Rafraîchit les stories toutes les 5 minutes
    this.subs.add(
      interval(5 * 60 * 1000).subscribe(() => this.loadStories())
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    clearInterval(this.progressInterval);
  }

  // ── Getters ──────────────────────────────────────────────
  get canPublish(): boolean {
    const role = this.authService.getRole();
    return this.authService .isLoggedIn()
  }

  get currentUserEmail(): string | null {
    return this.authService.getEmail();
  }

  get selectedEquipmentPrice(): number | null {
    if (!this.formData.equipmentId) return null;
    const eq = this.myEquipments.find(
      e => e.idEquipement === +this.formData.equipmentId
    );
    return eq ? eq.price : null;
  }

  get previewDiscountedPrice(): number {
    const price = this.selectedEquipmentPrice;
    if (!price) return 0;
    return price * (1 - this.formData.discount / 100);
  }

  // ── Chargement ───────────────────────────────────────────
  loadStories(): void {
    this.loading = true;
    this.subs.add(
      this.storyService.getActiveStories().subscribe({
        next:  (data) => { this.stories = data; this.loading = false; },
        error: ()     => { this.loading = false; }
      })
    );
  }

  loadMyEquipments(): void {
    this.subs.add(
      this.equipmentService.getMyEquipments().subscribe({
        next:  (data) => { this.myEquipments = data; },
        error: ()     => {}
      })
    );
  }

  // ── Viewer ───────────────────────────────────────────────
  openStory(index: number): void {
    this.currentIndex = index;
    this.currentStory = this.stories[index];
    this.isViewerOpen = true;
    this.viewedStories.add(this.currentStory.idStory);
    document.body.style.overflow = 'hidden';
    this.startProgress();
  }

  closeViewer(): void {
    this.isViewerOpen = false;
    this.currentStory = null;
    document.body.style.overflow = '';
    clearInterval(this.progressInterval);
    this.progressWidth = 0;
  }

  nextStory(): void {
    if (this.currentIndex < this.stories.length - 1) {
      this.currentIndex++;
      this.currentStory = this.stories[this.currentIndex];
      this.viewedStories.add(this.currentStory.idStory);
      this.resetProgress();
    } else {
      this.closeViewer();
    }
  }

  prevStory(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.currentStory = this.stories[this.currentIndex];
      this.resetProgress();
    }
  }

  startProgress(): void {
    this.progressWidth = 0;
    clearInterval(this.progressInterval);
    // 8000ms ÷ 80ms = 100 pas → chaque pas = 1%
    this.progressInterval = setInterval(() => {
      this.progressWidth += 1;
      if (this.progressWidth >= 100) {
        clearInterval(this.progressInterval);
        setTimeout(() => this.nextStory(), 100);
      }
    }, 80);
  }

  resetProgress(): void {
    clearInterval(this.progressInterval);
    this.progressWidth = 0;
    this.startProgress();
  }

  copyPromoCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      this.copied = true;
      this.showToast(`Code "${code}" copié ! 🎉`);
      setTimeout(() => { this.copied = false; }, 2500);
    });
  }

  // ── Formulaire ───────────────────────────────────────────
  openPublishModal(): void {
    this.editingStory = null;
    this.formData     = { equipmentId: 0, promoCode: '', discount: 20, message: '' };
    this.formError    = '';
    this.isFormOpen   = true;
    document.body.style.overflow = 'hidden';
  }

  openEditModal(story: StoryResponse): void {
    this.closeViewer();
    this.editingStory = story;
    this.formData = {
      equipmentId: story.equipmentId,
      promoCode:   story.promoCode,
      discount:    story.discount,
      message:     story.message
    };
    this.formError  = '';
    this.isFormOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeForm(): void {
    this.isFormOpen   = false;
    this.editingStory = null;
    this.formError    = '';
    document.body.style.overflow = '';
  }

  submitStory(): void {
    if (!this.editingStory && !this.formData.equipmentId) {
      this.formError = 'Veuillez choisir un équipement.'; return;
    }
    if (!this.formData.message.trim()) {
      this.formError = 'Le message est obligatoire.'; return;
    }
    if (!this.formData.promoCode.trim()) {
      this.formError = 'Le code promo est obligatoire.'; return;
    }
    if (this.formData.discount < 1 || this.formData.discount > 80) {
      this.formError = 'La réduction doit être entre 1% et 80%.'; return;
    }

    this.submitting = true;
    this.formError  = '';
    const payload: StoryRequest = {
      ...this.formData,
      promoCode: this.formData.promoCode.toUpperCase().trim()
    };

    if (this.editingStory) {
      this.subs.add(
        this.storyService.updateStory(this.editingStory.idStory, payload).subscribe({
          next:  () => {
            this.submitting = false;
            this.closeForm();
            this.loadStories();
            this.showToast('Story mise à jour ! ✨');
          },
          error: (err) => {
            this.submitting = false;
            this.formError  = err?.error?.message || 'Erreur lors de la mise à jour.';
          }
        })
      );
    } else {
      this.subs.add(
        this.storyService.publishStory(payload).subscribe({
          next:  () => {
            this.submitting = false;
            this.closeForm();
            this.loadStories();
            this.showToast('Story publiée pour 24h ! 🔥');
          },
          error: (err) => {
            this.submitting = false;
            this.formError  = err?.error?.message || 'Erreur lors de la publication.';
          }
        })
      );
    }
  }

  // ── Suppression ──────────────────────────────────────────
  confirmDelete(storyId: number): void {
    if (!confirm('Supprimer cette story ?')) return;
    this.subs.add(
      this.storyService.deleteStory(storyId).subscribe({
        next:  () => {
          this.closeViewer();
          this.loadStories();
          this.showToast('Story supprimée.');
        },
        error: () => this.showToast('Impossible de supprimer.', 'error')
      })
    );
  }

  // ── Helpers ──────────────────────────────────────────────
  isMyStory(story: StoryResponse | null): boolean {
    if (!story || !this.currentUserEmail) return false;
    return this.currentUserEmail === story.ownerEmail;
  }

  formatMinutes(minutes: number): string {
    if (!minutes || minutes <= 0) return 'Expiré';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m} min`;
  }

  getTimeAgo(dateStr: string | undefined): string {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const h    = Math.floor(diff / 3600000);
    if (h < 1)  return 'À l\'instant';
    if (h < 24) return `Il y a ${h}h`;
    return `Il y a ${Math.floor(h / 24)}j`;
  }

  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage = message;
    this.toastType    = type;
    this.toastVisible = true;
    setTimeout(() => { this.toastVisible = false; }, 3000);
  }

  trackByStory(_: number, s: StoryResponse): number {
    return s.idStory;
  }
}