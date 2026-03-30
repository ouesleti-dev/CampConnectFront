import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../../../frontoffice/shared/services/event.service';
import { PostService } from '../../../../../frontoffice/shared/services/post.service';
import { CommentService } from '../../../../../frontoffice/shared/services/comment.service';
import { EventDTO, PostDTO, CommentDTO } from '../../../../../frontoffice/shared/models/camping-forum.models';


@Component({
  selector: 'app-forum-page',
  templateUrl: './forum-page.component.html',
  styleUrls: ['./forum-page.component.css']
})
export class ForumPageComponent implements OnInit {
  
  events: EventDTO[] = [];
  selectedEventId: number | null = null;
  posts: PostDTO[] = [];
  selectedPost: PostDTO | null = null;
  comments: CommentDTO[] = [];
  loadingPosts = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private eventService: EventService,
    private postService: PostService,
    private commentService: CommentService
  ) {}

  ngOnInit(): void {
    this.eventService.getAll().subscribe({
      next: (data: EventDTO[]) => {  // ✅ Type ajouté
        this.events = data;
      }
    });
  }

  onEventChange(): void {
    if (!this.selectedEventId) return;
    
    this.loadingPosts = true;
    this.selectedPost = null;
    this.comments = [];
    
    this.postService.getByEvent(this.selectedEventId).subscribe({
      next: (data: PostDTO[]) => {  // ✅ Type ajouté
        this.posts = data;
        this.loadingPosts = false;
      },
      error: () => {
        this.loadingPosts = false;
      }
    });
  }

  viewComments(post: PostDTO): void {
    this.selectedPost = post;
    
    this.commentService.getByPost(post.id).subscribe({
      next: (data: CommentDTO[]) => {  // ✅ Type ajouté
        this.comments = data;
      }
    });
  }

  deletePost(id: number): void {
    if (!confirm('Supprimer ce post et tous ses commentaires ?')) return;
    
    this.postService.delete(id).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== id);
        if (this.selectedPost?.id === id) {
          this.selectedPost = null;
          this.comments = [];
        }
        this.successMessage = 'Post supprimé.';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la suppression.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  deleteComment(id: number): void {
    if (!confirm('Supprimer ce commentaire ?')) return;
    
    this.commentService.delete(id).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.id !== id);
        this.successMessage = 'Commentaire supprimé.';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la suppression.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }
}