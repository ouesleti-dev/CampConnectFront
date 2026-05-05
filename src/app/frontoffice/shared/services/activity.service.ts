import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ActivityDTO } from '../models/camping-forum.models';

@Injectable({ providedIn: 'root' })
export class ActivityService {
  constructor(private api: ApiService) {}

  getAll(): Observable<ActivityDTO[]> {
    return this.api.get<ActivityDTO[]>('/activities');
  }
  getByEvent(eventId: number): Observable<ActivityDTO[]> {
    return this.api.get<ActivityDTO[]>(`/activities/event/${eventId}`);
  }
  getByCamping(campingId: number): Observable<ActivityDTO[]> {
    return this.api.get<ActivityDTO[]>(`/activities/camping/${campingId}`);
  }
  create(data: any): Observable<ActivityDTO> {
    return this.api.post<ActivityDTO>('/activities', data);
  }
  update(id: number, data: any): Observable<ActivityDTO> {
    return this.api.put<ActivityDTO>(`/activities/${id}`, data);
  }
  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/activities/${id}`);
  }
}