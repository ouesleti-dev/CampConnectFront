import { Component, OnInit, OnDestroy } from '@angular/core';
import { Html5Qrcode } from 'html5-qrcode';
import { EventService } from '../../../../../frontoffice/shared/services/event.service';
import { PostService } from '../../../../../frontoffice/shared/services/post.service';
import { CommentService } from '../../../../../frontoffice/shared/services/comment.service';
import { TicketService } from '../../../../../frontoffice/shared/services/ticket.service';
import { EventDTO, PostDTO, CommentDTO, TicketDTO }
  from '../../../../../frontoffice/shared/models/camping-forum.models';

type BackTab = 'posts' | 'tickets';

@Component({
  selector: 'app-forum-page',
  templateUrl: './forum-page.component.html',
  styleUrls: ['./forum-page.component.css']
})
export class ForumPageComponent implements OnInit, OnDestroy {

  activeTab: BackTab = 'posts';

  // ── Posts/Comments ───────────────────────────────────────
  events: EventDTO[]             = [];
  selectedEventId: number | null = null;
  posts: PostDTO[]               = [];
  selectedPost: PostDTO | null   = null;
  comments: CommentDTO[]         = [];
  loadingPosts                   = false;

  // ── Messages ─────────────────────────────────────────────
  successMessage = '';
  errorMessage   = '';

  // ── Tickets ──────────────────────────────────────────────
  ticketsByEvent: TicketDTO[]       = [];
  loadingTickets                    = false;
  validateCode                      = '';
  validatingTicket                  = false;
  validatedTicket: TicketDTO | null = null;
  selectedEventIdForTickets: number | null = null;

  // ── Scanner ──────────────────────────────────────────────
  showScanner     = false;
  scanSuccess     = false;
  scanError       = false;
  lastScannedCode = '';
  private html5QrCode: Html5Qrcode | null = null;

  constructor(
    private eventService:   EventService,
    private postService:    PostService,
    private commentService: CommentService,
    private ticketService:  TicketService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  ngOnDestroy(): void {
    this.stopScanner();
  }

  // ── Tab ───────────────────────────────────────────────────
  setTab(tab: BackTab): void {
    this.activeTab = tab;
    if (tab !== 'tickets') this.stopScanner();
  }

  // ── Events ────────────────────────────────────────────────
  loadEvents(): void {
    this.eventService.getAll().subscribe({
      next: (data: EventDTO[]) => { this.events = data; }
    });
  }

  // ── Posts ─────────────────────────────────────────────────
  onEventChange(): void {
    if (!this.selectedEventId) return;
    this.loadingPosts = true;
    this.selectedPost = null;
    this.comments     = [];
    this.postService.getByEvent(this.selectedEventId).subscribe({
      next: (data: PostDTO[]) => {
        this.posts = data;
        this.loadingPosts = false;
      },
      error: () => { this.loadingPosts = false; }
    });
  }

  viewComments(post: PostDTO): void {
    this.selectedPost = post;
    this.commentService.getByPost(post.id).subscribe({
      next: (data: CommentDTO[]) => { this.comments = data; }
    });
  }

  deletePost(id: number): void {
    if (!confirm('Supprimer ce post et tous ses commentaires ?')) return;
    this.postService.delete(id).subscribe({
      next: () => {
        this.posts = this.posts.filter((p: PostDTO) => p.id !== id);
        if (this.selectedPost?.id === id) {
          this.selectedPost = null;
          this.comments = [];
        }
        this.showSuccess('Post supprimé.');
      },
      error: () => this.showError('Erreur lors de la suppression.')
    });
  }

  deleteComment(id: number): void {
    if (!confirm('Supprimer ce commentaire ?')) return;
    this.commentService.delete(id).subscribe({
      next: () => {
        this.comments = this.comments.filter((c: CommentDTO) => c.id !== id);
        this.showSuccess('Commentaire supprimé.');
      },
      error: () => this.showError('Erreur lors de la suppression.')
    });
  }

  // ── Tickets ───────────────────────────────────────────────
  loadTicketsByEvent(eventId: number): void {
    this.loadingTickets = true;
    this.ticketService.getTicketsByEvent(eventId).subscribe({
      next: (data: TicketDTO[]) => {
        this.ticketsByEvent = data;
        this.loadingTickets = false;
      },
      error: () => {
        this.showError('Erreur chargement tickets');
        this.loadingTickets = false;
      }
    });
  }

  onEventChangeForTickets(): void {
    if (!this.selectedEventIdForTickets) return;
    this.loadTicketsByEvent(this.selectedEventIdForTickets);
  }

  validateTicket(): void {
    if (!this.validateCode.trim()) return;
    this.validatingTicket = true;
    this.ticketService.validateTicket(this.validateCode.trim()).subscribe({
      next: (ticket: TicketDTO) => {
        this.validatedTicket  = ticket;
        this.validatingTicket = false;
        this.validateCode     = '';
        this.scanSuccess      = true;
        this.scanError        = false;
        this.showSuccess(`✅ Ticket ${ticket.ticketCode} validé !`);
        const idx = this.ticketsByEvent
          .findIndex((t: TicketDTO) => t.id === ticket.id);
        if (idx !== -1) this.ticketsByEvent[idx] = ticket;
        setTimeout(() => {
          this.scanSuccess     = false;
          this.lastScannedCode = '';
          if (this.showScanner) this.resumeScanner();
        }, 3000);
      },
      error: (err: any) => {
        this.validatingTicket = false;
        this.scanError        = true;
        this.scanSuccess      = false;
        this.showError(err.error?.error || 'Ticket invalide ou déjà utilisé');
        setTimeout(() => {
          this.scanError       = false;
          this.lastScannedCode = '';
          if (this.showScanner) this.resumeScanner();
        }, 3000);
      }
    });
  }

  getTicketStatusClass(status: string): string {
    const map: Record<string, string> = {
      'VALID':     'badge-active',
      'USED':      'badge-default',
      'CANCELLED': 'badge-inactive'
    };
    return map[status] || 'badge-default';
  }

  // ── Scanner html5-qrcode ──────────────────────────────────
  toggleScanner(): void {
    if (this.showScanner) {
      this.showScanner = false;
      this.stopScanner();
    } else {
      this.showScanner     = true;
      this.scanSuccess     = false;
      this.scanError       = false;
      this.validatedTicket = null;
      setTimeout(() => this.startScanner(), 300);
    }
  }

  // ⭐ FIX — utilise getCameras() pour trouver la caméra automatiquement
  private startScanner(): void {
    Html5Qrcode.getCameras().then((cameras: any[]) => {
      if (cameras.length > 0) {
        this.html5QrCode = new Html5Qrcode('qr-reader');
        this.html5QrCode.start(
          cameras[0].id,
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText: string) => {
            if (decodedText === this.lastScannedCode) return;
            this.lastScannedCode = decodedText;
            this.html5QrCode?.pause();
            let ticketCode = decodedText;
            if (decodedText.includes('TICKET:')) {
              ticketCode = decodedText
                .split('|')[0]
                .replace('TICKET:', '')
                .trim();
            }
            this.validateCode = ticketCode;
            this.validateTicket();
          },
          () => {}
        ).catch((err: any) => {
          console.error('Erreur démarrage caméra:', err);
          this.showError('Impossible d\'accéder à la caméra.');
          this.showScanner = false;
        });
      } else {
        this.showError('Aucune caméra détectée sur cet appareil.');
        this.showScanner = false;
      }
    }).catch((err: any) => {
      console.error('Erreur getCameras:', err);
      this.showError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
      this.showScanner = false;
    });
  }

  resumeScanner(): void {
    this.validatedTicket = null;
    this.html5QrCode?.resume();
  }

  private stopScanner(): void {
    if (this.html5QrCode) {
      this.html5QrCode.stop()
        .then(() => { this.html5QrCode = null; })
        .catch(() => { this.html5QrCode = null; });
    }
  }

  // ── Helpers ───────────────────────────────────────────────
  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }

  private showError(msg: string): void {
    this.errorMessage = msg;
    setTimeout(() => this.errorMessage = '', 4000);
  }
}