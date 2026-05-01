import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StoryRequest, StoryResponse } from '../models/story.model';

@Injectable({
  providedIn: 'root'
})
export class StoryService {

  private baseUrl = 'http://localhost:8088/campConnect/story';

  constructor(private http: HttpClient) {}

  /** GET /story/active — public, toutes les stories actives */
  getActiveStories(): Observable<StoryResponse[]> {
    return this.http.get<StoryResponse[]>(`${this.baseUrl}/active`);
  }

  /** GET /story/my — mes stories (propriétaire connecté) */
  getMyStories(): Observable<StoryResponse[]> {
    return this.http.get<StoryResponse[]>(`${this.baseUrl}/my`);
  }

  /** POST /story — publier une story */
  publishStory(dto: StoryRequest): Observable<StoryResponse> {
    return this.http.post<StoryResponse>(this.baseUrl, dto);
  }

  /** PUT /story/{storyId} — modifier une story */
  updateStory(storyId: number, dto: StoryRequest): Observable<StoryResponse> {
    return this.http.put<StoryResponse>(`${this.baseUrl}/${storyId}`, dto);
  }

  /** DELETE /story/{storyId} — supprimer une story */
  deleteStory(storyId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${storyId}`);
  }

  /** POST /story/{equipmentId}/apply-promo?code=XX */
  applyPromoCode(equipmentId: number, code: string): Observable<StoryResponse> {
    const params = new HttpParams().set('code', code);
    return this.http.post<StoryResponse>(
      `${this.baseUrl}/${equipmentId}/apply-promo`,
      {},
      { params }
    );
  }
}