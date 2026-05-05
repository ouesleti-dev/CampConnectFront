// ============================================================
//  SCORING ENGINE — Types & Interfaces
//  Fichier : scoring-engine.types.ts
// ============================================================

/** Définition d'un critère de scoring */
export interface ScoringCriterion {
  id: string;           // identifiant unique (ex: 'quiz', 'entretien')
  label: string;        // libellé affiché
  weight: number;       // poids entre 0 et 1 (la somme de tous les poids doit = 1)
  enabled: boolean;     // actif ou désactivé
  rawScore?: number;    // valeur brute 0–100 calculée en amont
}

/** Règle d'élimination ou de pénalité */
export interface ScoringRule {
  id: string;
  label: string;
  criterionId: string;          // sur quel critère s'applique la règle
  type: 'elimination' | 'bonus' | 'penalty';
  threshold: number;            // valeur déclenchante
  value?: number;               // bonus/pénalité à appliquer (si type != elimination)
}

/** Seuil de niveau */
export interface ScoringThreshold {
  level: 'junior' | 'confirmé' | 'expert';
  minScore: number;
  maxScore: number;
  color: string;
}

/** Configuration complète du moteur (stockable en JSON) */
export interface ScoringConfig {
  criteria: ScoringCriterion[];
  rules: ScoringRule[];
  thresholds: ScoringThreshold[];
  formulaOverride?: (scores: Record<string, number>) => number; // optionnel
}

/** Résultat produit par le moteur */
export interface ScoringResult {
  globalScore: number;                        // 0–100
  subScores: Record<string, number>;          // { criterionId: score }
  level: ScoringThreshold | null;             // niveau détecté
  insights: string[];                          // messages d'analyse
  eliminated: boolean;                         // règle d'élimination déclenchée
  eliminationReason?: string;                  // pourquoi éliminé
  weightedContributions: Record<string, number>; // contribution de chaque critère
}
