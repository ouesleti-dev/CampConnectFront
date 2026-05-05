import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  CampingPartnershipApi,
  PartnerUserWriteApi,
  ContratApi,
  InterviewMeetingApi,
  OfferApi,
  PartnerInterviewApi,
  PartnerQuestionApi,
  PartnerQuizApi,
  PartnerUserSummaryApi,
  QuizReponseApi,
} from './partnership-api.types';

@Injectable({ providedIn: 'root' })
export class PartnershipHttpService {
  private readonly base = `${environment.apiUrl}/api/partnership`;

  constructor(private http: HttpClient) {}

  getPartnerUsers(): Observable<PartnerUserSummaryApi[]> {
    return this.http.get<PartnerUserSummaryApi[]>(`${this.base}/partner-users`);
  }

  createPartnerUser(body: PartnerUserWriteApi): Observable<PartnerUserSummaryApi> {
    return this.http.post<PartnerUserSummaryApi>(`${this.base}/partner-users`, body);
  }

  updatePartnerUser(id: number, body: PartnerUserWriteApi): Observable<PartnerUserSummaryApi> {
    return this.http.put<PartnerUserSummaryApi>(`${this.base}/partner-users/${id}`, body);
  }

  deletePartnerUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/partner-users/${id}`);
  }

  getCampings(): Observable<CampingPartnershipApi[]> {
    return this.http.get<CampingPartnershipApi[]>(`${this.base}/campings`);
  }

  createCamping(body: Record<string, unknown>): Observable<CampingPartnershipApi> {
    return this.http.post<CampingPartnershipApi>(`${this.base}/campings`, body);
  }

  updateCamping(id: number, body: Record<string, unknown>): Observable<CampingPartnershipApi> {
    return this.http.put<CampingPartnershipApi>(`${this.base}/campings/${id}`, body);
  }

  deleteCamping(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/campings/${id}`);
  }

  getOffers(): Observable<OfferApi[]> {
    return this.http.get<OfferApi[]>(`${this.base}/offers`);
  }
  createOffer(body: Record<string, unknown>): Observable<OfferApi> {
    return this.http.post<OfferApi>(`${this.base}/offers`, body);
  }
  updateOffer(id: number, body: Record<string, unknown>): Observable<OfferApi> {
    return this.http.put<OfferApi>(`${this.base}/offers/${id}`, body);
  }
  deleteOffer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/offers/${id}`);
  }

  getContrats(): Observable<ContratApi[]> {
    return this.http.get<ContratApi[]>(`${this.base}/contrats`);
  }
  createContrat(body: Record<string, unknown>): Observable<ContratApi> {
    return this.http.post<ContratApi>(`${this.base}/contrats`, body);
  }
  updateContrat(id: number, body: Record<string, unknown>): Observable<ContratApi> {
    return this.http.put<ContratApi>(`${this.base}/contrats/${id}`, body);
  }
  deleteContrat(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/contrats/${id}`);
  }

  getInterviews(): Observable<PartnerInterviewApi[]> {
    return this.http.get<PartnerInterviewApi[]>(`${this.base}/interviews`);
  }
  createInterview(body: Record<string, unknown>): Observable<PartnerInterviewApi> {
    return this.http.post<PartnerInterviewApi>(`${this.base}/interviews`, body);
  }
  updateInterview(id: number, body: Record<string, unknown>): Observable<PartnerInterviewApi> {
    return this.http.put<PartnerInterviewApi>(`${this.base}/interviews/${id}`, body);
  }
  deleteInterview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/interviews/${id}`);
  }

  getMeetings(): Observable<InterviewMeetingApi[]> {
    return this.http.get<InterviewMeetingApi[]>(`${this.base}/meetings`);
  }
  createMeeting(body: Record<string, unknown>): Observable<InterviewMeetingApi> {
    return this.http.post<InterviewMeetingApi>(`${this.base}/meetings`, body);
  }
  updateMeeting(id: number, body: Record<string, unknown>): Observable<InterviewMeetingApi> {
    return this.http.put<InterviewMeetingApi>(`${this.base}/meetings/${id}`, body);
  }
  deleteMeeting(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/meetings/${id}`);
  }

  getQuizzes(): Observable<PartnerQuizApi[]> {
    return this.http.get<PartnerQuizApi[]>(`${this.base}/quizzes`);
  }
  createQuiz(body: Record<string, unknown>): Observable<PartnerQuizApi> {
    return this.http.post<PartnerQuizApi>(`${this.base}/quizzes`, body);
  }
  updateQuiz(id: number, body: Record<string, unknown>): Observable<PartnerQuizApi> {
    return this.http.put<PartnerQuizApi>(`${this.base}/quizzes/${id}`, body);
  }
  deleteQuiz(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/quizzes/${id}`);
  }

  getQuestions(): Observable<PartnerQuestionApi[]> {
    return this.http.get<PartnerQuestionApi[]>(`${this.base}/questions`);
  }
  createQuestion(body: Record<string, unknown>): Observable<PartnerQuestionApi> {
    return this.http.post<PartnerQuestionApi>(`${this.base}/questions`, body);
  }
  updateQuestion(id: number, body: Record<string, unknown>): Observable<PartnerQuestionApi> {
    return this.http.put<PartnerQuestionApi>(`${this.base}/questions/${id}`, body);
  }
  deleteQuestion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/questions/${id}`);
  }

  getReponses(): Observable<QuizReponseApi[]> {
    return this.http.get<QuizReponseApi[]>(`${this.base}/reponses`);
  }
  createReponse(body: Record<string, unknown>): Observable<QuizReponseApi> {
    return this.http.post<QuizReponseApi>(`${this.base}/reponses`, body);
  }
  updateReponse(id: number, body: Record<string, unknown>): Observable<QuizReponseApi> {
    return this.http.put<QuizReponseApi>(`${this.base}/reponses/${id}`, body);
  }
  deleteReponse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/reponses/${id}`);
  }
}
