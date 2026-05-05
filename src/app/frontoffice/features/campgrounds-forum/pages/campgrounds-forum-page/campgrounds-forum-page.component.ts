import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../../shared/services/event.service';
import { PostService } from '../../../../shared/services/post.service';
import { CommentService } from '../../../../shared/services/comment.service';
import { ActivityService } from '../../../../shared/services/activity.service';
import { ParticipationService } from '../../../../shared/services/participation.service';
import { CampingService } from '../../../../shared/services/camping.service';
import {
  EventDTO, PostDTO, CommentDTO,
  ActivityDTO, ParticipationDTO, CampingDTO
} from '../../../../shared/models/camping-forum.models';

type ActiveTab = 'events' | 'activities' | 'campings' | 'add';
type AddTab    = 'add-camping' | 'add-event' | 'add-activity' | null;

@Component({
  selector: 'app-campgrounds-forum-page',
  templateUrl: './campgrounds-forum-page.component.html',
  styleUrls: ['./campgrounds-forum-page.component.css']
})
export class CampgroundsForumPageComponent implements OnInit {

  // ── Onglet actif ────────────────────────────────────────────
  activeTab: ActiveTab = 'events';
  addTab: AddTab = null;

  // ── Données ─────────────────────────────────────────────────
  events: EventDTO[]         = [];
  campings: CampingDTO[]     = [];
  activities: ActivityDTO[]  = [];
  posts: PostDTO[]           = [];
  comments: CommentDTO[]     = [];

  selectedEvent:   EventDTO   | null = null;
  selectedPost:    PostDTO    | null = null;
  selectedCamping: CampingDTO | null = null;

  myParticipationIds: number[] = [];

  // ── Loading flags ────────────────────────────────────────────
  loadingEvents     = false;
  loadingPosts      = false;
  loadingComments   = false;
  loadingCampings   = false;
  loadingActivities = false;

  // ── Messages ─────────────────────────────────────────────────
  successMessage = '';
  errorMessage   = '';
  validationErrors: Record<string, string> = {};

  // ── Formulaires ──────────────────────────────────────────────
  newPostContent    = '';
  newCommentContent = '';

  newCamping  = { name: '', address: '', description: '', postalCode: '', status: 'OPEN' };
  newEvent    = { title: '', eventDate: '', maxParticipants: 50, status: 'PLANNED', wasteCollected: 0, campingId: null as number | null };
  newActivity = { name: '', description: '', duration: 60, difficulty: 'EASY', eventId: null as number | null, campingId: null as number | null };

  // ── ⭐ Edition Post & Comment ─────────────────────────────────
  editingPost:    { id: number; content: string } | null = null;
  editingComment: { id: number; content: string } | null = null;
  currentUserEmail = localStorage.getItem('email') || '';

  constructor(
    private eventService:         EventService,
    private postService:          PostService,
    private commentService:       CommentService,
    private activityService:      ActivityService,
    private participationService: ParticipationService,
    private campingService:       CampingService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
    this.loadCampings();
    this.loadAllActivities();
    this.loadMyParticipations();
  }

  // ── Navigation ───────────────────────────────────────────────
  setTab(tab: ActiveTab): void {
    this.activeTab = tab;
    this.addTab    = null;
    if (tab === 'campings'   && this.campings.length === 0)   this.loadCampings();
    if (tab === 'activities' && this.activities.length === 0) this.loadAllActivities();
  }

  setAddTab(tab: AddTab): void {
    this.activeTab = 'add';
    this.addTab    = tab;
    if (tab === 'add-event' && this.campings.length === 0) this.loadCampings();
    if (tab === 'add-activity') {
      if (this.campings.length === 0) this.loadCampings();
      if (this.events.length === 0)   this.loadEvents();
    }
  }

  // ── Chargements ───────────────────────────────────────────────
  loadEvents(): void {
    this.loadingEvents = true;
    this.eventService.getAll().subscribe({
      next: (data: EventDTO[]) => { this.events = data; this.loadingEvents = false; },
      error: () => { this.errorMessage = 'Erreur chargement événements'; this.loadingEvents = false; }
    });
  }

  loadCampings(): void {
    this.loadingCampings = true;
    this.campingService.getAll().subscribe({
      next: (data: CampingDTO[]) => { this.campings = data; this.loadingCampings = false; },
      error: () => { this.loadingCampings = false; }
    });
  }

  loadAllActivities(): void {
    this.loadingActivities = true;
    this.activityService.getAll().subscribe({
      next: (data: ActivityDTO[]) => { this.activities = data; this.loadingActivities = false; },
      error: () => { this.loadingActivities = false; }
    });
  }

  loadMyParticipations(): void {
    this.participationService.getMyParticipations().subscribe({
      next: (data: ParticipationDTO[]) => {
        this.myParticipationIds = data.map((p: ParticipationDTO) => p.activityId);
      }
    });
  }

  // ── Events / Forum ────────────────────────────────────────────
  selectEvent(event: EventDTO): void {
    this.selectedEvent = event;
    this.selectedPost  = null;
    this.comments      = [];
    this.editingPost   = null;    // ⭐ reset si on change d'event
    this.editingComment = null;   // ⭐ reset si on change d'event
    this.loadPosts(event.id);
    this.loadActivitiesForEvent(event.id);
  }

  loadPosts(eventId: number): void {
    this.loadingPosts = true;
    this.postService.getByEvent(eventId).subscribe({
      next: (data: PostDTO[]) => { this.posts = data; this.loadingPosts = false; },
      error: () => { this.loadingPosts = false; }
    });
  }

  loadActivitiesForEvent(eventId: number): void {
    this.activityService.getByEvent(eventId).subscribe({
      next: (data: ActivityDTO[]) => { this.activities = data; }
    });
  }

  selectPost(post: PostDTO): void {
    if (this.selectedPost?.id === post.id) {
      this.selectedPost   = null;
      this.comments       = [];
      this.editingComment = null; // ⭐ reset
      return;
    }
    this.selectedPost    = post;
    this.editingComment  = null; // ⭐ reset quand on change de post
    this.loadingComments = true;
    this.commentService.getByPost(post.id).subscribe({
      next: (data: CommentDTO[]) => { this.comments = data; this.loadingComments = false; },
      error: () => { this.loadingComments = false; }
    });
  }

  submitPost(): void {
    if (!this.newPostContent.trim() || !this.selectedEvent) return;
    this.postService.create({
      content: this.newPostContent,
      eventId: this.selectedEvent.id
    }).subscribe({
      next: (p: PostDTO) => {
        this.posts.unshift(p);
        this.newPostContent = '';
        this.showSuccess('Post publié !');
      },
      error: () => this.showError('Erreur publication')
    });
  }

  submitComment(): void {
    if (!this.newCommentContent.trim() || !this.selectedPost) return;
    this.commentService.create({
      content: this.newCommentContent,
      postId: this.selectedPost.id
    }).subscribe({
      next: (c: CommentDTO) => { this.comments.push(c); this.newCommentContent = ''; },
      error: () => this.showError('Erreur commentaire')
    });
  }

  joinActivity(activity: ActivityDTO): void {
    this.participationService.register({
      activityId: activity.id,
      status: 'REGISTERED'
    }).subscribe({
      next: () => {
        this.myParticipationIds.push(activity.id);
        activity.totalParticipations++;
        this.showSuccess(`Inscrit à "${activity.name}" !`);
      },
      error: (err: any) => this.showError(err.error?.error || 'Erreur inscription')
    });
  }

  // ── ⭐ Modification Post ───────────────────────────────────────
  openEditPost(post: PostDTO): void {
    this.editingPost    = { id: post.id, content: post.content };
    this.editingComment = null; // ferme l'edit comment si ouvert
  }

  saveEditPost(): void {
    if (!this.editingPost) return;
    this.postService.update(this.editingPost.id, {
      content: this.editingPost.content
    }).subscribe({
      next: (updated: PostDTO) => {
        const idx = this.posts.findIndex((p: PostDTO) => p.id === updated.id);
        if (idx !== -1) this.posts[idx] = updated;
        this.editingPost = null;
        this.showSuccess('Post modifié !');
      },
      error: (err: any) => this.showError(err.error?.error || 'Erreur modification post')
    });
  }

  cancelEditPost(): void { this.editingPost = null; }

  isMyPost(post: PostDTO): boolean {
    return post.authorFullName !== null && this.currentUserEmail !== '';
  }

  // ── ⭐ Modification Comment ────────────────────────────────────
  openEditComment(comment: CommentDTO): void {
    this.editingComment = { id: comment.id, content: comment.content };
    this.editingPost    = null; // ferme l'edit post si ouvert
  }

  saveEditComment(): void {
    if (!this.editingComment) return;
    this.commentService.update(this.editingComment.id, {
      content: this.editingComment.content
    }).subscribe({
      next: (updated: CommentDTO) => {
        const idx = this.comments.findIndex((c: CommentDTO) => c.id === updated.id);
        if (idx !== -1) this.comments[idx] = updated;
        this.editingComment = null;
        this.showSuccess('Commentaire modifié !');
      },
      error: (err: any) => this.showError(err.error?.error || 'Erreur modification commentaire')
    });
  }

  cancelEditComment(): void { this.editingComment = null; }

  // ── Formulaires d'ajout ───────────────────────────────────────
  submitCamping(): void {
    if (!this.newCamping.name.trim() || !this.newCamping.address.trim()) {
      this.showError('Nom et adresse obligatoires'); return;
    }
    this.campingService.create(this.newCamping).subscribe({
      next: (c: CampingDTO) => {
        this.campings.push(c);
        this.newCamping = { name: '', address: '', description: '', postalCode: '', status: 'OPEN' };
        this.showSuccess(`Camping "${c.name}" créé !`);
        this.setTab('campings');
      },
      error: (err: any) => this.showError(this.getValidationErrors(err))
    });
  }

  submitEvent(): void {
    if (!this.newEvent.title.trim() || !this.newEvent.eventDate || !this.newEvent.campingId) {
      this.showError('Titre, date et camping obligatoires'); return;
    }
    this.eventService.create(this.newEvent).subscribe({
      next: (e: EventDTO) => {
        this.events.push(e);
        this.newEvent = { title: '', eventDate: '', maxParticipants: 50, status: 'PLANNED', wasteCollected: 0, campingId: null };
        this.showSuccess(`Événement "${e.title}" créé !`);
        this.setTab('events');
      },
      error: (err: any) => this.showError(this.getValidationErrors(err))
    });
  }

  submitActivity(): void {
    if (!this.newActivity.name.trim()) {
      this.showError('Nom obligatoire'); return;
    }
    if (!this.newActivity.eventId && !this.newActivity.campingId) {
      this.showError('Choisissez un événement ou un camping'); return;
    }
    this.activityService.create(this.newActivity).subscribe({
      next: (a: ActivityDTO) => {
        this.newActivity = { name: '', description: '', duration: 60, difficulty: 'EASY', eventId: null, campingId: null };
        this.showSuccess(`Activité "${a.name}" créée !`);
        this.loadAllActivities();
        this.setTab('activities');
      },
      error: (err: any) => this.showError(this.getValidationErrors(err))
    });
  }

  // ── Helpers ───────────────────────────────────────────────────
  isAlreadyJoined(activityId: number): boolean {
    return this.myParticipationIds.includes(activityId);
  }

  getDifficultyClass(d: string): string {
    return ({ 'EASY': 'badge-easy', 'MEDIUM': 'badge-medium', 'HARD': 'badge-hard' } as Record<string, string>)[d] || '';
  }

  getStatusClass(s: string): string {
    return ({ 'PLANNED': 'status-planned', 'ONGOING': 'status-ongoing', 'COMPLETED': 'status-completed' } as Record<string, string>)[s] || '';
  }
  private getValidationErrors(err: any): string {
  this.validationErrors = {};
  if (err.error && typeof err.error === 'object' && !err.error.error) {
    this.validationErrors = err.error;
    const messages = Object.values(err.error) as string[];
    return messages.join(' | ');
  }
  if (err.error?.error) return err.error.error;
  return 'Erreur inattendue';
}

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }

  private showError(msg: string): void {
    this.errorMessage = msg;
    setTimeout(() => this.errorMessage = '', 4000);
  }
}
