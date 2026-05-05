import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CandidateFeatures {
  response_length: number;
  filler_word_count: number;
  keyword_match_score: number;
  response_time_seconds: number;
  sentiment_score: number;
  coherence_score: number;
  confidence_score: number;
}

export interface PredictionResult {
  candidate_score: number;
  recommendation: string;
  confidence: number;
  model_version: string;
}

@Injectable({
  providedIn: 'root'
})
export class InterviewService {

  constructor(private http: HttpClient) { }

  predict(features: CandidateFeatures): Observable<PredictionResult> {
    return this.http.post<PredictionResult>('/api/predict', features);
  }
}
