import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  DropoutFeaturesDTO, DropoutPredictionDTO,
  EventFeaturesDTO,   EventPredictionDTO
} from '../models/camping-forum.models';

@Injectable({ providedIn: 'root' })
export class MlPredictionService {

  constructor(private api: ApiService) {}

  // ⭐ Appelle Spring Boot (qui proxifie vers FastAPI)
  // URL: http://localhost:8088/campConnect/ml/predict-dropout
  predictDropout(features: DropoutFeaturesDTO): Observable<DropoutPredictionDTO> {
    return this.api.post<DropoutPredictionDTO>('/ml/predict-dropout', features);
  }

  // URL: http://localhost:8088/campConnect/ml/predict-participation
  predictParticipation(features: EventFeaturesDTO): Observable<EventPredictionDTO> {
    return this.api.post<EventPredictionDTO>('/ml/predict-participation', features);
  }
}