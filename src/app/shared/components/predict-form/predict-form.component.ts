import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InterviewService, PredictionResult } from '../../../core/services/interview.service';

@Component({
  selector: 'app-predict-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="prediction-container">
      <div class="glass-card">
        <h2 class="title">AI Recruiter Evaluation</h2>
        <p class="subtitle">Enter candidate metrics to generate a prediction</p>
        
        <form [formGroup]="predictForm" (ngSubmit)="onSubmit()" class="form-grid">
          <div class="input-group">
            <label>Response Length</label>
            <input type="number" formControlName="response_length" step="0.1" placeholder="e.g. 150">
          </div>
          <div class="input-group">
            <label>Filler Word Count</label>
            <input type="number" formControlName="filler_word_count" step="1" placeholder="e.g. 5">
          </div>
          <div class="input-group">
            <label>Keyword Match Score (0-1)</label>
            <input type="number" formControlName="keyword_match_score" step="0.01" min="0" max="1" placeholder="e.g. 0.85">
          </div>
          <div class="input-group">
            <label>Response Time (seconds)</label>
            <input type="number" formControlName="response_time_seconds" step="0.1" placeholder="e.g. 12.5">
          </div>
          <div class="input-group">
            <label>Sentiment Score (-1 to 1)</label>
            <input type="number" formControlName="sentiment_score" step="0.01" min="-1" max="1" placeholder="e.g. 0.5">
          </div>
          <div class="input-group">
            <label>Coherence Score (0-1)</label>
            <input type="number" formControlName="coherence_score" step="0.01" min="0" max="1" placeholder="e.g. 0.9">
          </div>
          <div class="input-group">
            <label>Confidence Score (0-1)</label>
            <input type="number" formControlName="confidence_score" step="0.01" min="0" max="1" placeholder="e.g. 0.88">
          </div>
          
          <button type="submit" [disabled]="predictForm.invalid || isLoading" class="submit-btn">
            <span *ngIf="!isLoading">Analyze Candidate</span>
            <span *ngIf="isLoading" class="loader"></span>
          </button>
        </form>

        <div *ngIf="result" class="result-section fade-in">
          <div class="score-circle">
            <svg viewBox="0 0 36 36" class="circular-chart">
              <path class="circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path class="circle"
                [attr.stroke-dasharray]="result.candidate_score + ', 100'"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" class="percentage">{{ result.candidate_score | number:'1.0-0' }}</text>
            </svg>
          </div>
          
          <div class="result-details">
            <h3>Recommendation</h3>
            <span class="badge" [ngClass]="getBadgeClass(result.recommendation)">
              {{ result.recommendation | uppercase }}
            </span>
            <p class="confidence">Confidence: {{ result.confidence | percent:'1.1-2' }}</p>
            <p class="model-version">Model v{{ result.model_version }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .prediction-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100%;
      padding: 2rem;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      font-family: 'Inter', sans-serif;
    }
    .glass-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 2.5rem;
      width: 100%;
      max-width: 600px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      color: #fff;
    }
    .title {
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      text-align: center;
      background: linear-gradient(to right, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      text-align: center;
      color: #94a3b8;
      margin-bottom: 2rem;
      font-size: 0.95rem;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.2rem;
    }
    .input-group {
      display: flex;
      flex-direction: column;
    }
    .input-group label {
      font-size: 0.85rem;
      color: #cbd5e1;
      margin-bottom: 0.4rem;
    }
    .input-group input {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 0.8rem 1rem;
      color: #f8fafc;
      font-size: 0.95rem;
      transition: all 0.3s ease;
    }
    .input-group input:focus {
      outline: none;
      border-color: #38bdf8;
      box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
    }
    .submit-btn {
      grid-column: span 2;
      background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 1rem;
      font-weight: 600;
      font-size: 1.05rem;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 1rem;
    }
    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.5);
    }
    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .result-section {
      margin-top: 2.5rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-around;
    }
    .score-circle {
      width: 120px;
    }
    .circular-chart {
      display: block;
      margin: 0 auto;
      max-width: 80%;
      max-height: 250px;
    }
    .circle-bg {
      fill: none;
      stroke: rgba(255, 255, 255, 0.1);
      stroke-width: 3.8;
    }
    .circle {
      fill: none;
      stroke-width: 2.8;
      stroke-linecap: round;
      stroke: #38bdf8;
      animation: progress 1s ease-out forwards;
    }
    @keyframes progress {
      0% { stroke-dasharray: 0 100; }
    }
    .percentage {
      fill: #fff;
      font-family: sans-serif;
      font-size: 0.5em;
      text-anchor: middle;
      font-weight: bold;
    }
    .result-details {
      text-align: center;
    }
    .result-details h3 {
      font-size: 1rem;
      color: #94a3b8;
      margin-bottom: 0.5rem;
    }
    .badge {
      padding: 0.5rem 1.5rem;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 1.1rem;
      letter-spacing: 1px;
      display: inline-block;
      margin-bottom: 1rem;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    .badge-hire { background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.5); }
    .badge-maybe { background: rgba(234, 179, 8, 0.2); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.5); }
    .badge-reject { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.5); }
    .confidence { font-size: 0.95rem; color: #e2e8f0; }
    .model-version { font-size: 0.75rem; color: #64748b; margin-top: 0.3rem; }
    .fade-in { animation: fadeIn 0.5s ease-in; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .loader {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 1s ease-in-out infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class PredictFormComponent {
  predictForm: FormGroup;
  result: PredictionResult | null = null;
  isLoading = false;

  constructor(private fb: FormBuilder, private interviewService: InterviewService) {
    this.predictForm = this.fb.group({
      response_length: [150.5, Validators.required],
      filler_word_count: [4, Validators.required],
      keyword_match_score: [0.85, [Validators.required, Validators.min(0), Validators.max(1)]],
      response_time_seconds: [12.0, Validators.required],
      sentiment_score: [0.6, [Validators.required, Validators.min(-1), Validators.max(1)]],
      coherence_score: [0.8, [Validators.required, Validators.min(0), Validators.max(1)]],
      confidence_score: [0.9, [Validators.required, Validators.min(0), Validators.max(1)]],
    });
  }

  onSubmit() {
    if (this.predictForm.valid) {
      this.isLoading = true;
      this.interviewService.predict(this.predictForm.value).subscribe({
        next: (res) => {
          this.result = res;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        }
      });
    }
  }

  getBadgeClass(recommendation: string): string {
    const rec = recommendation.toLowerCase();
    if (rec === 'hire') return 'badge-hire';
    if (rec === 'maybe') return 'badge-maybe';
    return 'badge-reject';
  }
}
