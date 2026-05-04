import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { EventStatsDTO, CampingRankingDTO } from '../models/camping-forum.models';

@Injectable({ providedIn: 'root' })
export class StatsService {
  constructor(private api: ApiService) {}

  getEventStats(eventId: number): Observable<EventStatsDTO> {
    return this.api.get<EventStatsDTO>(`/stats/event/${eventId}`);
  }

  getCampingRanking(): Observable<CampingRankingDTO[]> {
    return this.api.get<CampingRankingDTO[]>('/stats/campings/ranking');
  }
}