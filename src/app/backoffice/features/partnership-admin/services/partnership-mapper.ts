import {
  Camping,
  Contrat,
  ContratStatut,
  Entretien,
  EntretienDecision,
  EntretienMode,
  Offre,
  OffreStatut,
  PartnerUser,
  QuestionPartenaire,
  QuestionType,
  QuizPartenaire,
  Rencontre,
  ReponseQuiz,
} from '../models/partnership.models';
import {
  CampingPartnershipApi,
  ContratApi,
  InterviewMeetingApi,
  OfferApi,
  PartnerInterviewApi,
  PartnerQuestionApi,
  PartnerQuizApi,
  PartnerUserSummaryApi,
  PartnerUserWriteApi,
  QuizReponseApi,
} from './partnership-api.types';

export function sliceDate(v: string | undefined): string {
  if (!v) return '';
  return v.length >= 10 ? v.slice(0, 10) : v;
}

export function mapOffreStatutToApi(s: OffreStatut): string {
  const m: Record<OffreStatut, string> = {
    PROPOSEE: 'PROPOSED',
    ACCEPTEE: 'ACCEPTED',
    REFUSEE: 'REFUSED',
    EXPIREE: 'EXPIRED',
  };
  return m[s] ?? 'PROPOSED';
}

export function mapOffreStatutFromApi(s: string): OffreStatut {
  const m: Record<string, OffreStatut> = {
    PROPOSED: 'PROPOSEE',
    ACCEPTED: 'ACCEPTEE',
    REFUSED: 'REFUSEE',
    EXPIRED: 'EXPIREE',
  };
  return m[s] ?? 'PROPOSEE';
}

export function mapContratStatutToApi(s: ContratStatut): string {
  const m: Record<ContratStatut, string> = {
    EN_COURS: 'IN_PROGRESS',
    EXPIRE: 'EXPIRED',
    RESILIE: 'TERMINATED',
  };
  return m[s] ?? 'IN_PROGRESS';
}

export function mapContratStatutFromApi(s: string): ContratStatut {
  const m: Record<string, ContratStatut> = {
    IN_PROGRESS: 'EN_COURS',
    EXPIRED: 'EXPIRE',
    TERMINATED: 'RESILIE',
  };
  return m[s] ?? 'EN_COURS';
}

export function mapDecisionToApi(d: EntretienDecision): string {
  const m: Record<EntretienDecision, string> = {
    VALIDER: 'VALIDATE',
    REFUSER: 'REFUSE',
    A_AMELIORER: 'TO_IMPROVE',
  };
  return m[d] ?? 'TO_IMPROVE';
}

export function mapDecisionFromApi(d: string): EntretienDecision {
  const m: Record<string, EntretienDecision> = {
    VALIDATE: 'VALIDER',
    REFUSE: 'REFUSER',
    TO_IMPROVE: 'A_AMELIORER',
  };
  return m[d] ?? 'A_AMELIORER';
}

export function mapRencontreModeToApi(m: EntretienMode): string {
  const r: Record<EntretienMode, string> = {
    PRESENTIEL: 'IN_PERSON',
    VISIO: 'VIDEO',
    TELEPHONE: 'PHONE',
  };
  return r[m] ?? 'VIDEO';
}

export function mapRencontreModeFromApi(m: string): EntretienMode {
  const r: Record<string, EntretienMode> = {
    IN_PERSON: 'PRESENTIEL',
    VIDEO: 'VISIO',
    PHONE: 'TELEPHONE',
  };
  return r[m] ?? 'VISIO';
}

export function mapQuestionTypeToApi(t: QuestionType): string {
  const m: Record<QuestionType, string> = {
    QCM: 'MCQ',
    OUVERTE: 'OPEN',
    NOTE: 'NOTE',
    OUI_NON: 'YES_NO',
  };
  return m[t] ?? 'OPEN';
}

export function mapQuestionTypeFromApi(t: string): QuestionType {
  const m: Record<string, QuestionType> = {
    MCQ: 'QCM',
    OPEN: 'OUVERTE',
    NOTE: 'NOTE',
    YES_NO: 'OUI_NON',
  };
  return m[t] ?? 'OUVERTE';
}

export function mapUsersFromApi(rows: PartnerUserSummaryApi[]): PartnerUser[] {
  return rows.map((u) => ({
    id: u.id,
    firstName: u.firstName ?? '',
    lastName: u.lastName ?? '',
    email: u.email ?? '',
    phone: u.phone ?? '',
    score: u.score ?? 0,
    actif: u.actif ?? true,
  }));
}

/** Corps API création / mise à jour partenaire (sans score : calculé côté serveur). */
export function buildPartnerUserWriteBody(
  u: Omit<PartnerUser, 'id'> & { password?: string },
): PartnerUserWriteApi {
  const body: PartnerUserWriteApi = {
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phone: u.phone,
    actif: u.actif,
  };
  if (u.password != null && u.password.trim() !== '') {
    body.password = u.password.trim();
  }
  return body;
}

export function buildCampingWriteBody(c: Omit<Camping, 'id'> | Camping, campingId?: number): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name: c.nom,
    localisation: c.localisation,
    capacite: c.capacite,
    partnerIds: c.partnerIds ?? [],
  };
  if (campingId != null) {
    body['campingId'] = campingId;
  }
  return body;
}

export function mapCampingsFromApi(rows: CampingPartnershipApi[]): Camping[] {
  return rows.map((c) => ({
    id: Number(c.campingId),
    nom: c.name ?? '',
    localisation: c.localisation ?? '',
    capacite: c.capacite ?? 0,
    partnerIds: [...(c.partnerIds ?? [])],
  }));
}

export function mapOffersFromApi(rows: OfferApi[]): Offre[] {
  return rows.map((o) => ({
    id: o.offerId,
    titre: o.title ?? '',
    description: o.description ?? '',
    campingId: o.campingId ?? 0,
    datePublication: sliceDate(o.startDate),
    statut: mapOffreStatutFromApi(o.status),
    price: o.price ?? 0,
  }));
}

export function mapContratsFromApi(rows: ContratApi[]): Contrat[] {
  return rows.map((c) => ({
    id: c.contractId,
    partenaireId: 0,
    offreId: c.offerId,
    montant: 0,
    dateDebut: sliceDate(c.startDate),
    dateFin: sliceDate(c.endDate),
    statut: mapContratStatutFromApi(c.status),
    tauxCommission: c.commission ?? 0,
  }));
}

export function patchContratMontants(contrats: Contrat[], offres: Offre[]): Contrat[] {
  return contrats.map((c) => {
    const of = offres.find((o) => o.id === c.offreId);
    return { ...c, montant: of?.price ?? 0 };
  });
}

export function mapEntretiensFromApi(rows: PartnerInterviewApi[]): Entretien[] {
  return rows.map((e) => ({
    id: e.interviewId,
    partenaireId: e.userId ?? 0,
    date: e.interviewDate,
    mode: 'VISIO' as EntretienMode,
    decision: mapDecisionFromApi(e.decision ?? ''),
    scoreGlobal: e.globalScore ?? 0,
  }));
}

export function mapRencontresFromApi(rows: InterviewMeetingApi[]): Rencontre[] {
  return rows.map((m) => ({
    id: m.meetingId,
    entretienId: m.interviewId ?? 0,
    date: sliceDate(m.meetingDate),
    mode: mapRencontreModeFromApi(m.mode ?? 'VIDEO'),
    compteRendu: m.report ?? '',
  }));
}

export function mapQuizzesFromApi(rows: PartnerQuizApi[]): QuizPartenaire[] {
  return rows.map((q) => ({
    id: q.quizId,
    titre: q.title ?? '',
    partenaireId: q.userId ?? 0,
    maxScore: q.maxScore ?? 100,
  }));
}

export function mapQuestionsFromApi(rows: PartnerQuestionApi[]): QuestionPartenaire[] {
  return rows.map((q) => ({
    id: q.questionId,
    quizId: q.quizId ?? 0,
    texte: q.label ?? '',
    type: mapQuestionTypeFromApi(q.type ?? 'OPEN'),
    points: q.weight ?? 0,
    optionsJson: undefined,
    bonneReponse: undefined,
  }));
}

export function mapReponsesFromApi(
  rows: QuizReponseApi[],
  questions: QuestionPartenaire[],
  quizzes: QuizPartenaire[],
): ReponseQuiz[] {
  return rows.map((r) => {
    const q = questions.find((x) => x.id === r.questionId);
    const quiz = q ? quizzes.find((z) => z.id === q.quizId) : undefined;
    return {
      id: r.responseId,
      questionId: r.questionId ?? 0,
      partenaireId: quiz?.partenaireId ?? 0,
      valeur: r.value ?? '',
      score: r.grade ?? 0,
    };
  });
}

export function buildCreateOfferBody(o: Omit<Offre, 'id'>): Record<string, unknown> {
  return {
    title: o.titre,
    description: o.description ?? '',
    startDate: o.datePublication,
    endDate: o.datePublication,
    price: 0,
    status: mapOffreStatutToApi(o.statut),
    campingId: o.campingId,
  };
}

export function buildUpdateOfferBody(o: Offre): Record<string, unknown> {
  return {
    offerId: o.id,
    title: o.titre,
    description: o.description ?? '',
    startDate: o.datePublication,
    endDate: o.datePublication,
    price: o.price ?? 0,
    status: mapOffreStatutToApi(o.statut),
    campingId: o.campingId,
  };
}

export function buildContratBody(
  c: Omit<Contrat, 'id'> | Contrat,
  id?: number,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    startDate: c.dateDebut,
    endDate: c.dateFin,
    commission: c.tauxCommission,
    status: mapContratStatutToApi(c.statut),
    offerId: c.offreId,
  };
  if (id != null) {
    body['contractId'] = id;
  }
  return body;
}

export function buildInterviewBody(
  e: Omit<Entretien, 'id'> | Entretien,
  id?: number,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    interviewDate: e.date,
    globalScore: e.scoreGlobal,
    decision: mapDecisionToApi(e.decision),
    userId: e.partenaireId || null,
  };
  if (id != null) body['interviewId'] = id;
  return body;
}

export function buildMeetingBody(
  r: Omit<Rencontre, 'id'> | Rencontre,
  id?: number,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    meetingDate: r.date,
    startTime: '09:00:00',
    endTime: '10:00:00',
    mode: mapRencontreModeToApi(r.mode),
    location: '',
    report: r.compteRendu,
    interviewId: r.entretienId,
  };
  if (id != null) body['meetingId'] = id;
  return body;
}

export function buildQuizBody(
  q: Omit<QuizPartenaire, 'id'> | QuizPartenaire,
  id?: number,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    title: q.titre,
    maxScore: q.maxScore ?? 100,
    userId: q.partenaireId || null,
  };
  if (id != null) body['quizId'] = id;
  return body;
}

export function buildQuestionBody(
  q: Omit<QuestionPartenaire, 'id'> | QuestionPartenaire,
  id?: number,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    label: q.texte,
    type: mapQuestionTypeToApi(q.type),
    weight: q.points,
    quizId: q.quizId || null,
  };
  if (id != null) body['questionId'] = id;
  return body;
}

export function buildReponseBody(
  r: Omit<ReponseQuiz, 'id'> | ReponseQuiz,
  id?: number,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    value: r.valeur,
    grade: r.score,
    questionId: r.questionId || null,
  };
  if (id != null) body['responseId'] = id;
  return body;
}

export const seedCampings: Camping[] = [
  { id: 1, nom: 'Azur Beach', localisation: 'Nabeul', capacite: 120, partnerIds: [] },
  { id: 2, nom: 'Mountain Camp', localisation: 'Ain Draham', capacite: 80, partnerIds: [] },
];
