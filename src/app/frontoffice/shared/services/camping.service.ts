import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CampingDTO } from '../models/camping-forum.models';

@Injectable({ providedIn: 'root' })
export class CampingService {
  constructor(private api: ApiService) {}

  getAll(): Observable<CampingDTO[]> {
    return this.api.get<CampingDTO[]>('/campings');
  }
  getById(id: number): Observable<CampingDTO> {
    return this.api.get<CampingDTO>(`/campings/${id}`);
  }
  create(data: any): Observable<CampingDTO> {
    return this.api.post<CampingDTO>('/campings', data);
  }
  update(id: number, data: any): Observable<CampingDTO> {
    return this.api.put<CampingDTO>(`/campings/${id}`, data);
  }
  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/campings/${id}`);
  }
}
