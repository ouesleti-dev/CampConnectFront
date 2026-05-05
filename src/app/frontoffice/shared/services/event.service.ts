import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { EventDTO } from '../models/camping-forum.models';

@Injectable({ providedIn: 'root' })
export class EventService {
  constructor(private api: ApiService) {}

  getAll(): Observable<EventDTO[]> {
    return this.api.get<EventDTO[]>('/events');
  }
  getById(id: number): Observable<EventDTO> {
    return this.api.get<EventDTO>(`/events/${id}`);
  }
  getByCamping(campingId: number): Observable<EventDTO[]> {
    return this.api.get<EventDTO[]>(`/events/camping/${campingId}`);
  }
  create(data: any): Observable<EventDTO> {
    return this.api.post<EventDTO>('/events', data);
  }
  update(id: number, data: any): Observable<EventDTO> {
    return this.api.put<EventDTO>(`/events/${id}`, data);
  }
  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/events/${id}`);
  }
}
