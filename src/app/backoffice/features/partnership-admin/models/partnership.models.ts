export type OffreStatut = 'PROPOSEE' | 'ACCEPTEE' | 'REFUSEE' | 'EXPIREE';
export type ContratStatut = 'EN_COURS' | 'EXPIRE' | 'RESILIE';
export type EntretienMode = 'PRESENTIEL' | 'VISIO' | 'TELEPHONE';
export type EntretienDecision = 'VALIDER' | 'REFUSER' | 'A_AMELIORER';
export type QuestionType = 'QCM' | 'OUVERTE' | 'NOTE' | 'OUI_NON';

export interface PartnerUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  score: number;
  actif: boolean;
}

export interface Camping {
  id: number;
  nom: string;
  localisation: string;
  capacite: number;
  partnerIds: number[];
}

export interface Offre {
  id: number;
  titre: string;
  description: string;
  campingId: number;
  datePublication: string;
  statut: OffreStatut;
  /** Prix côté API Spring (offre.price) */
  price?: number;
}

export interface Contrat {
  id: number;
  partenaireId: number;
  offreId: number;
  montant: number;
  dateDebut: string;
  dateFin: string;
  statut: ContratStatut;
  tauxCommission: number;
}

export interface Entretien {
  id: number;
  partenaireId: number;
  date: string;
  mode: EntretienMode;
  decision: EntretienDecision;
  scoreGlobal: number;
  workflowStep?: string;
  intervenantId?: number;
  duree?: number;
  notes?: string;
}

export interface Rencontre {
  id: number;
  entretienId: number;
  date: string;
  mode: EntretienMode;
  compteRendu: string;
}

export interface QuizPartenaire {
  id: number;
  titre: string;
  partenaireId: number;
  maxScore?: number;
}

export interface QuestionPartenaire {
  id: number;
  quizId: number;
  texte: string;
  type: QuestionType;
  points: number;
  /** JSON string: choix pour QCM, ex. ["A","B","C"] */
  optionsJson?: string;
  /** bonne réponse / référence pour scoring auto (optionnel) */
  bonneReponse?: string;
}

export interface ReponseQuiz {
  id: number;
  questionId: number;
  partenaireId: number;
  valeur: string;
  score: number;
}

export interface PartnershipState {
  users: PartnerUser[];
  campings: Camping[];
  offres: Offre[];
  contrats: Contrat[];
  entretiens: Entretien[];
  rencontres: Rencontre[];
  quizzes: QuizPartenaire[];
  questions: QuestionPartenaire[];
  reponses: ReponseQuiz[];
}
