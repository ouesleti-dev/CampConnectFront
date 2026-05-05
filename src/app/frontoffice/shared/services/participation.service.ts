import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ParticipationDTO } from '../models/camping-forum.models';

@Injectable({ providedIn: 'root' })
export class ParticipationService {
  constructor(private api: ApiService) {}

  getMyParticipations(): Observable<ParticipationDTO[]> {
    return this.api.get<ParticipationDTO[]>('/participations/my');
  }
  getByActivity(activityId: number): Observable<ParticipationDTO[]> {
    return this.api.get<ParticipationDTO[]>(`/participations/activity/${activityId}`);
  }
  register(data: any): Observable<ParticipationDTO> {
    return this.api.post<ParticipationDTO>('/participations', data);
  }
  updateStatus(id: number, data: any): Observable<ParticipationDTO> {
    return this.api.put<ParticipationDTO>(`/participations/${id}`, data);
  }
  cancel(id: number): Observable<void> {
    return this.api.delete<void>(`/participations/${id}`);
  }
}
