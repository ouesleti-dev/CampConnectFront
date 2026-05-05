import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PostDTO } from '../models/camping-forum.models';

@Injectable({ providedIn: 'root' })
export class PostService {
  constructor(private api: ApiService) {}

  getAll(): Observable<PostDTO[]> {
    return this.api.get<PostDTO[]>('/posts');
  }
  getByEvent(eventId: number): Observable<PostDTO[]> {
    return this.api.get<PostDTO[]>(`/posts/event/${eventId}`);
  }
  getMyPosts(): Observable<PostDTO[]> {
    return this.api.get<PostDTO[]>('/posts/my');
  }
  create(data: any): Observable<PostDTO> {
    return this.api.post<PostDTO>('/posts', data);
  }
  update(id: number, data: any): Observable<PostDTO> {
    return this.api.put<PostDTO>(`/posts/${id}`, data);
  }
  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/posts/${id}`);
  }
}
