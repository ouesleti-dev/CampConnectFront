/** DTO alignés sur le backend Spring (JSON camelCase). */

export interface CampingPartnershipApi {
  campingId: number;
  name: string;
  localisation: string;
  capacite: number;
  partnerIds: number[];
}

export interface PartnerUserSummaryApi {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  score: number;
  actif: boolean;
}

/** Corps POST/PUT /partner-users (mot de passe optionnel à la création : défaut côté serveur). */
export interface PartnerUserWriteApi {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  actif: boolean;
  password?: string;
}

export interface OfferApi {
  offerId: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  price: number;
  status: string;
}

export interface ContratApi {
  contractId: number;
  startDate: string;
  endDate: string;
  commission: number;
  status: string;
  offerId: number;
}

export interface PartnerInterviewApi {
  interviewId: number;
  interviewDate: string;
  globalScore: number;
  decision: string;
  userId: number | null;
}

export interface InterviewMeetingApi {
  meetingId: number;
  meetingDate: string;
  startTime: string;
  endTime: string;
  mode: string;
  location: string;
  report: string;
  interviewId: number | null;
}

export interface PartnerQuizApi {
  quizId: number;
  title: string;
  maxScore: number;
  userId: number | null;
}

export interface PartnerQuestionApi {
  questionId: number;
  label: string;
  type: string;
  weight: number;
  quizId: number | null;
}

export interface QuizReponseApi {
  responseId: number;
  value: string;
  grade: number | null;
  questionId: number | null;
}
