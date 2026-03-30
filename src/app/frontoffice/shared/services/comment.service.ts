import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CommentDTO } from '../models/camping-forum.models';

@Injectable({ providedIn: 'root' })
export class CommentService {
  constructor(private api: ApiService) {}

  getByPost(postId: number): Observable<CommentDTO[]> {
    return this.api.get<CommentDTO[]>(`/comments/post/${postId}`);
  }
  create(data: any): Observable<CommentDTO> {
    return this.api.post<CommentDTO>('/comments', data);
  }
  update(id: number, data: any): Observable<CommentDTO> {
    return this.api.put<CommentDTO>(`/comments/${id}`, data);
  }
  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/comments/${id}`);
  }
}