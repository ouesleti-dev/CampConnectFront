import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import {
  Camping,
  Contrat,
  Entretien,
  Offre,
  PartnerUser,
  PartnershipState,
  QuestionPartenaire,
  QuizPartenaire,
  Rencontre,
  ReponseQuiz,
} from '../models/partnership.models';
import { PartnershipHttpService } from './partnership-http.service';
import {
  buildContratBody,
  buildCreateOfferBody,
  buildInterviewBody,
  buildMeetingBody,
  buildQuestionBody,
  buildQuizBody,
  buildReponseBody,
  buildPartnerUserWriteBody,
  buildCampingWriteBody,
  buildUpdateOfferBody,
  mapContratsFromApi,
  mapEntretiensFromApi,
  mapOffersFromApi,
  mapQuestionsFromApi,
  mapQuizzesFromApi,
  mapCampingsFromApi,
  mapRencontresFromApi,
  mapReponsesFromApi,
  mapUsersFromApi,
  patchContratMontants,
  seedCampings,
} from './partnership-mapper';

const STORAGE_KEY = 'campconnect-partnership-admin-v1';

function partnershipApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error;
    if (body && typeof body === 'object' && 'error' in body) {
      const msg = (body as { error?: unknown }).error;
      if (typeof msg === 'string' && msg.trim()) return msg;
    }
    if (typeof err.error === 'string' && err.error.trim()) return err.error;
    if (err.status === 403)
      return 'Accès refusé (cette action est réservée aux rôles ADMIN ou PARTNER).';
    if (err.status === 401) return 'Session expirée ou non connecté.';
    if (err.status === 0) return 'Serveur injoignable (réseau ou CORS).';
  }
  return fallback;
}

function safePartnership$<T>(
  source: Observable<T>,
  fallback: T,
  label: string,
  onFail?: () => void,
): Observable<T> {
  return source.pipe(
    catchError((e) => {
      console.warn(`[partnership] ${label}`, e);
      onFail?.();
      return of(fallback);
    }),
  );
}

const emptyState = (): PartnershipState => ({
  users: [],
  campings: [...seedCampings],
  offres: [],
  contrats: [],
  entretiens: [],
  rencontres: [],
  quizzes: [],
  questions: [],
  reponses: [],
});

function loadState(): PartnershipState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PartnershipState;
  } catch {
    /* ignore */
  }
  return emptyState();
}

@Injectable({ providedIn: 'root' })
export class PartnershipStoreService {
  private readonly state$ = new BehaviorSubject<PartnershipState>(loadState());

  constructor(
    private readonly api: PartnershipHttpService,
    private readonly toast: ToastrService,
  ) {}

  snapshot(): PartnershipState {
    return this.state$.getValue();
  }

  observe(): Observable<PartnershipState> {
    return this.state$.asObservable();
  }

  private persist(next: PartnershipState): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    this.state$.next(next);
  }

  private nextId<T extends { id: number }>(items: T[]): number {
    return items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1;
  }

  /**
   * Supprime le cache local partenariat puis recharge depuis l’API.
   * Utile si des erreurs réseau ont laissé des listes vides persistées.
   */
  clearLocalCacheAndRefreshFromBackend(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    this.state$.next(emptyState());
    this.refreshFromBackend();
  }

  /** Charge ou recharge toutes les entités depuis le backend Spring. */
  refreshFromBackend(): void {
    if (!environment.useBackendPartnership) {
      return;
    }
    const PARTNERSHIP_REFRESH_SOURCES = 9;
    let failCount = 0;
    const markFail = (): void => {
      failCount++;
    };
    forkJoin({
      partnerUsers: safePartnership$(this.api.getPartnerUsers(), [], 'partnerUsers', markFail),
      campings: safePartnership$(this.api.getCampings(), [], 'campings', markFail),
      offers: safePartnership$(this.api.getOffers(), [], 'offers', markFail),
      contrats: safePartnership$(this.api.getContrats(), [], 'contrats', markFail),
      interviews: safePartnership$(this.api.getInterviews(), [], 'interviews', markFail),
      meetings: safePartnership$(this.api.getMeetings(), [], 'meetings', markFail),
      quizzes: safePartnership$(this.api.getQuizzes(), [], 'quizzes', markFail),
      questions: safePartnership$(this.api.getQuestions(), [], 'questions', markFail),
      reponses: safePartnership$(this.api.getReponses(), [], 'reponses', markFail),
    }).subscribe({
      next: (data) => {
        if (failCount >= PARTNERSHIP_REFRESH_SOURCES) {
          this.toast.error(
            'Aucune donnée partenariat n’a pu être chargée (backend arrêté, CORS ou réseau). L’affichage conserve l’état précédent.',
          );
          return;
        }
        const prev = this.snapshot();
        const fromApi = mapCampingsFromApi(data.campings ?? []);
        const campings =
          fromApi.length > 0 ? fromApi : prev.campings?.length ? prev.campings : [...seedCampings];
        const users = mapUsersFromApi(data.partnerUsers);
        const offres = mapOffersFromApi(data.offers);
        let contrats = patchContratMontants(mapContratsFromApi(data.contrats), offres);
        const entretiensApi = mapEntretiensFromApi(data.interviews);
        const entretiens = entretiensApi.map(apiEnt => {
          // Preserve local UI fields that backend doesn't store
          const existing = prev.entretiens?.find(pe => pe.id === apiEnt.id);
          if (existing) {
            return {
              ...apiEnt,
              mode: existing.mode ?? apiEnt.mode,
              workflowStep: existing.workflowStep,
              intervenantId: existing.intervenantId,
              duree: existing.duree,
              notes: existing.notes,
            };
          }
          // Also try to match by date and partenaireId for newly added ones
          const newlyAdded = prev.entretiens?.find(pe => pe.id < 0 && pe.partenaireId === apiEnt.partenaireId && pe.date.startsWith(apiEnt.date.slice(0, 10)));
          if (newlyAdded) {
            return {
              ...apiEnt,
              mode: newlyAdded.mode,
              workflowStep: newlyAdded.workflowStep,
              intervenantId: newlyAdded.intervenantId,
              duree: newlyAdded.duree,
              notes: newlyAdded.notes,
            };
          }
          return apiEnt;
        });
        const rencontres = mapRencontresFromApi(data.meetings);
        const quizzes = mapQuizzesFromApi(data.quizzes);
        const questions = mapQuestionsFromApi(data.questions);
        const reponses = mapReponsesFromApi(data.reponses, questions, quizzes);
        this.persist({
          users,
          campings,
          offres,
          contrats,
          entretiens,
          rencontres,
          quizzes,
          questions,
          reponses,
        });
        if (failCount > 0) {
          this.toast.warning(
            'Certaines données partenariat n’ont pas pu être chargées. Vérifiez la console réseau (F12).',
          );
        }
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Impossible de charger les données partenariat (vérifiez le backend et la connexion).');
      },
    });
  }

  // --- Utilisateurs / campings (API MySQL si useBackendPartnership)
  addUser(u: Omit<PartnerUser, 'id'> & { password?: string }): void {
    if (!environment.useBackendPartnership) {
      const s = this.snapshot();
      this.persist({ ...s, users: [...s.users, { ...u, id: this.nextId(s.users) }] });
      return;
    }
    this.api.createPartnerUser(buildPartnerUserWriteBody(u)).subscribe({
      next: () => this.refreshFromBackend(),
      error: (err) =>
        this.toast.error(partnershipApiErrorMessage(err, 'Création partenaire échouée.')),
    });
  }
  updateUser(id: number, patch: Partial<PartnerUser> & { password?: string }): void {
    if (!environment.useBackendPartnership) {
      const s = this.snapshot();
      this.persist({ ...s, users: s.users.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
      return;
    }
    const cur = this.snapshot().users.find((x) => x.id === id);
    if (!cur) return;
    const merged: Omit<PartnerUser, 'id'> & { password?: string } = { ...cur, ...patch };
    this.api.updatePartnerUser(id, buildPartnerUserWriteBody(merged)).subscribe({
      next: () => this.refreshFromBackend(),
      error: (err) => this.toast.error(partnershipApiErrorMessage(err, 'Mise à jour partenaire échouée.')),
    });
  }
  deleteUser(id: number): void {
    if (!environment.useBackendPartnership) {
      const s = this.snapshot();
      this.persist({
        ...s,
        users: s.users.filter((x) => x.id !== id),
        campings: s.campings.map((c) => ({ ...c, partnerIds: c.partnerIds.filter((p) => p !== id) })),
      });
      return;
    }
    this.api.deletePartnerUser(id).subscribe({
      next: () => this.refreshFromBackend(),
      error: (err) => this.toast.error(partnershipApiErrorMessage(err, 'Suppression partenaire échouée.')),
    });
  }

  addCamping(c: Omit<Camping, 'id'>): void {
    if (!environment.useBackendPartnership) {
      const s = this.snapshot();
      this.persist({ ...s, campings: [...s.campings, { ...c, id: this.nextId(s.campings) }] });
      return;
    }
    this.api.createCamping(buildCampingWriteBody(c)).subscribe({
      next: () => this.refreshFromBackend(),
      error: (err) => this.toast.error(partnershipApiErrorMessage(err, 'Création camping échouée.')),
    });
  }
  updateCamping(id: number, patch: Partial<Camping>): void {
    if (!environment.useBackendPartnership) {
      const s = this.snapshot();
      this.persist({ ...s, campings: s.campings.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
      return;
    }
    const cur = this.snapshot().campings.find((x) => x.id === id);
    if (!cur) return;
    const merged: Camping = { ...cur, ...patch };
    this.api.updateCamping(id, buildCampingWriteBody(merged, id)).subscribe({
      next: () => this.refreshFromBackend(),
      error: (err) => this.toast.error(partnershipApiErrorMessage(err, 'Mise à jour camping échouée.')),
    });
  }
  deleteCamping(id: number): void {
    if (!environment.useBackendPartnership) {
      const s = this.snapshot();
      this.persist({ ...s, campings: s.campings.filter((x) => x.id !== id) });
      return;
    }
    this.api.deleteCamping(id).subscribe({
      next: () => this.refreshFromBackend(),
      error: (err) => this.toast.error(partnershipApiErrorMessage(err, 'Suppression camping échouée.')),
    });
  }

  // --- Offres
  addOffre(o: Omit<Offre, 'id'>): void {
    if (!environment.useBackendPartnership) {
      const s = this.snapshot();
      this.persist({ ...s, offres: [...s.offres, { ...o, id: this.nextId(s.offres) }] });
      return;
    }
    this.api.createOffer(buildCreateOfferBody(o)).subscribe({
      next: () => this.refreshFromBackend(),
      error: () => this.toast.error('Création offre échouée'),
    });
  }
  updateOffre(id: number, patch: Partial<Offre>): void {
    if (!environment.useBackendPartnership) {
      const s = this.snapshot();
      this.persist({ ...s, offres: s.offres.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
      return;
    }
    const cur = this.snapshot().offres.find((x) => x.id === id);
    if (!cur) return;
    const merged: Offre = { ...cur, ...patch };
    this.api.updateOffer(id, buildUpdateOfferBody(merged)).subscribe({
      next: () => this.refreshFromBackend(),
      error: () => this.toast.error('Mise à jour offre échouée'),
    });
  }
  deleteOffre(id: number): void {
    if (!environment.useBackendPartnership) {
      const s = this.snapshot();
      this.persist({ ...s, offres: s.offres.filter((x) => x.id !== id) });
      return;
    }
    this.api.deleteOffer(id).subscribe({
      next: () => this.refreshFromBackend(),
      error: () => this.toast.error('Suppression offre échouée'),
    });
  }

  // --- Contrats
  addContrat(c: Omit<Contrat, 'id'>): void {
    if (!environment.useBackendPartnership) {
      const s = this.snapshot();
      this.persist({ ...s, contrats: [...s.contrats, { ...c, id: this.nextId(s.contrats) }] });
      return;
    }
    this.api.createContrat(buildContratBody(c)).subscribe({
      next: () => this.refreshFromBackend(),
      error: () => this.toast.error('Création contrat échouée'),
    });
  }
  updateContrat(id: number, patch: Partial<Contrat>): void {
    if (!environment.useBackendPartnership) {
      const s = this.snapshot();
      this.persist({ ...s, contrats: s.contrats.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
      return;
    }
    const cur = this.snapshot().contrats.find((x) => x.id === id);
    if (!cur) return;
    const merged: Contrat = { ...cur, ...patch };
    this.api.updateContrat(id, buildContratBody(merged, id)).subscribe({
      next: () => this.refreshFromBackend(),
      error: () => this.toast.error('Mise à jour contrat échouée'),
    });
  }
  deleteContrat(id: number): void {
    if (!environment.useBackendPartnership) {
      const s = this.snapshot();
      this.persist({ ...s, contrats: s.contrats.filter((x) => x.id !== id) });
      return;
    }
    this.api.deleteContrat(id).subscribe({
      next: () => this.refreshFromBackend(),
      error: () => this.toast.error('Suppression contrat échouée'),
    });
  }

  commissionMontant(c: Contrat): number {
    return (Number(c.montant) * Number(c.tauxCommission || 0)) / 100;
  }

  // --- Entretiens
  addEntretien(e: Omit<Entretien, 'id'>): void {
    if (!environment.useBackendPartnership) {
      const s = this.snapshot();
      this.persist({ ...s, entretiens: [...s.entretiens, { ...e, id: this.nextId(s.entretiens) }] as Entretien[] });
      return;
    }
    // Optimistically save locally with a negative ID to preserve fields during refresh
    const s = this.snapshot();
    const tempId = -Math.round(Math.random() * 1000000);
    this.persist({ ...s, entretiens: [...s.entretiens, { ...e, id: tempId } as Entretien] });

    this.api.createInterview(buildInterviewBody(e)).subscribe({
      next: () => this.refreshFromBackend(),
      error: () => {
        this.toast.error('Création entretien échouée');
        this.refreshFromBackend();
      }
    });
  }
  updateEntretien(id: number, patch: Partial<Entretien>): void {
    if (!environment.useBackendPartnership) {
      const s = this.snapshot();
      this.persist({ ...s, entretiens: s.entretiens.map((x) => (x.id === id ? { ...x, ...patch } : x)) as Entretien[] });
      return;
    }
    // Update local state first to preserve fields
    const s = this.snapshot();
    this.persist({ ...s, entretiens: s.entretiens.map((x) => (x.id === id ? { ...x, ...patch } : x)) as Entretien[] });

    const cur = this.snapshot().entretiens.find((x) => x.id === id);
    if (!cur) return;
    const merged: Entretien = { ...cur, ...patch };
    this.api.updateInterview(id, buildInterviewBody(merged, id)).subscribe({
      next: () => this.refreshFromBackend(),
      error: () => this.toast.error('Mise à jour entretien échouée'),
    });
  }
  deleteEntretien(id: number): void {
    if (!environment.useBackendPartnership) return;
    this.api.deleteInterview(id).subscribe({
      next: () => this.refreshFromBackend(),
      error: () => this.toast.error('Suppression entretien échouée'),
    });
  }

  // --- Rencontres
  addRencontre(r: Omit<Rencontre, 'id'>): void {
    if (!environment.useBackendPartnership) return;
    this.api.createMeeting(buildMeetingBody(r)).subscribe({
      next: () => this.refreshFromBackend(),
      error: () => this.toast.error('Création rencontre échouée'),
    });
  }
  updateRencontre(id: number, patch: Partial<Rencontre>): void {
    if (!environment.useBackendPartnership) return;
    const cur = this.snapshot().rencontres.find((x) => x.id === id);
    if (!cur) return;
    const merged: Rencontre = { ...cur, ...patch };
    this.api.updateMeeting(id, buildMeetingBody(merged, id)).subscribe({
      next: () => this.refreshFromBackend(),
      error: () => this.toast.error('Mise à jour rencontre échouée'),
    });
  }
  deleteRencontre(id: number): void {
    if (!environment.useBackendPartnership) return;
    this.api.deleteMeeting(id).subscribe({
      next: () => this.refreshFromBackend(),
      error: () => this.toast.error('Suppression rencontre échouée'),
    });
  }

  // --- Quiz
  addQuiz(q: Omit<QuizPartenaire, 'id'>): void {
    if (!environment.useBackendPartnership) return;
    this.api.createQuiz(buildQuizBody(q)).subscribe({
      next: () => this.refreshFromBackend(),
      error: () => this.toast.error('Création quiz échouée'),
    });
  }
  updateQuiz(id: number, patch: Partial<QuizPartenaire>): void {
    if (!environment.useBackendPartnership) return;
    const cur = this.snapshot().quizzes.find((x) => x.id === id);
    if (!cur) return;
    const merged: QuizPartenaire = { ...cur, ...patch };
    this.api.updateQuiz(id, buildQuizBody(merged, id)).subscribe({
      next: () => this.refreshFromBackend(),
      error: () => this.toast.error('Mise à jour quiz échouée'),
    });
  }
  deleteQuiz(id: number): void {
    if (!environment.useBackendPartnership) return;
    this.api.deleteQuiz(id).subscribe({
      next: () => this.refreshFromBackend(),
      error: () => this.toast.error('Suppression quiz échouée'),
    });
  }

  addQuestion(q: Omit<QuestionPartenaire, 'id'>): void {
    if (!environment.useBackendPartnership) return;
    this.api.createQuestion(buildQuestionBody(q)).subscribe({
      next: () => this.refreshFromBackend(),
      error: () => this.toast.error('Création question échouée'),
    });
  }
  updateQuestion(id: number, patch: Partial<QuestionPartenaire>): void {
    if (!environment.useBackendPartnership) return;
    const cur = this.snapshot().questions.find((x) => x.id === id);
    if (!cur) return;
    const merged: QuestionPartenaire = { ...cur, ...patch };
    this.api.updateQuestion(id, buildQuestionBody(merged, id)).subscribe({
      next: () => this.refreshFromBackend(),
      error: () => this.toast.error('Mise à jour question échouée'),
    });
  }
  deleteQuestion(id: number): void {
    if (!environment.useBackendPartnership) return;
    this.api.deleteQuestion(id).subscribe({
      next: () => this.refreshFromBackend(),
      error: () => this.toast.error('Suppression question échouée'),
    });
  }

  // --- Réponses
  addReponse(r: Omit<ReponseQuiz, 'id' | 'score'> & { score?: number }): void {
    if (!environment.useBackendPartnership) return;
    const s = this.snapshot();
    const question = s.questions.find((q) => q.id === r.questionId);
    const score = r.score ?? this.computeQuestionScore(question, r.valeur);
    const full: ReponseQuiz = {
      id: 0,
      questionId: r.questionId,
      partenaireId: r.partenaireId,
      valeur: r.valeur,
      score,
    };
    this.api.createReponse(buildReponseBody(full)).subscribe({
      next: () => this.refreshFromBackend(),
      error: () => this.toast.error('Enregistrement réponse échoué'),
    });
  }

  deleteReponse(id: number): void {
    if (!environment.useBackendPartnership) return;
    this.api.deleteReponse(id).subscribe({
      next: () => this.refreshFromBackend(),
      error: () => this.toast.error('Suppression réponse échouée'),
    });
  }

  computeQuestionScore(question: QuestionPartenaire | undefined, valeur: string): number {
    if (!question) return 0;
    const v = valeur.trim();
    const pts = question.points || 0;
    switch (question.type) {
      case 'OUI_NON':
        if (question.bonneReponse && v.toUpperCase() === question.bonneReponse.toUpperCase()) return pts;
        return 0;
      case 'NOTE': {
        const n = Number(v);
        if (Number.isNaN(n) || n < 1 || n > 10) return 0;
        return (n / 10) * pts;
      }
      case 'QCM':
        if (question.bonneReponse && v === question.bonneReponse) return pts;
        return 0;
      case 'OUVERTE':
        return v.length > 3 ? pts * 0.5 : 0;
      default:
        return 0;
    }
  }

  stats$(): Observable<{ offres: number; contratsActifs: number; scoreMoyen: number }> {
    return this.observe().pipe(
      map((s) => ({
        offres: s.offres.length,
        contratsActifs: s.contrats.filter((c) => c.statut === 'EN_COURS').length,
        scoreMoyen: s.users.length
          ? Math.round(s.users.reduce((a, u) => a + (u.score || 0), 0) / s.users.length)
          : 0,
      })),
    );
  }

  resetDemo(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.persist(emptyState());
    this.refreshFromBackend();
  }
}
