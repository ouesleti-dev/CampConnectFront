import { Injectable } from '@angular/core';
import {
  ScoringConfig,
  ScoringResult,
  ScoringCriterion,
  ScoringRule,
  ScoringThreshold,
} from './scoring-engine.types';

// ============================================================
//  SCORING ENGINE SERVICE
//  Fichier : scoring-engine.service.ts
// ============================================================

@Injectable({ providedIn: 'root' })
export class ScoringEngineService {

  // ── Configuration par défaut ────────────────────────────────
  private defaultConfig: ScoringConfig = {
    criteria: [
      { id: 'quiz',       label: 'Résultat Quiz',          weight: 0.4, enabled: true },
      { id: 'entretien',  label: 'Performance Entretien',  weight: 0.35, enabled: true },
      { id: 'coherence',  label: 'Cohérence des réponses', weight: 0.15, enabled: true },
      { id: 'communication', label: 'Communication',       weight: 0.10, enabled: true },
    ],
    rules: [
      {
        id: 'elim_entretien',
        label: 'Élimination si score entretien < 30',
        criterionId: 'entretien',
        type: 'elimination',
        threshold: 30,
      },
      {
        id: 'elim_quiz',
        label: 'Élimination si score quiz < 20',
        criterionId: 'quiz',
        type: 'elimination',
        threshold: 20,
      },
      {
        id: 'bonus_expert_quiz',
        label: 'Bonus +5 si quiz >= 90',
        criterionId: 'quiz',
        type: 'bonus',
        threshold: 90,
        value: 5,
      },
      {
        id: 'penalty_hesitation',
        label: 'Pénalité -5 si communication < 40',
        criterionId: 'communication',
        type: 'penalty',
        threshold: 40,
        value: -5,
      },
    ],
    thresholds: [
      { level: 'junior',    minScore: 0,   maxScore: 49,  color: '#f59e0b' },
      { level: 'confirmé',  minScore: 50,  maxScore: 74,  color: '#3b82f6' },
      { level: 'expert',    minScore: 75,  maxScore: 100, color: '#10b981' },
    ],
  };

  // ── Config active (peut être modifiée dynamiquement) ─────────
  private activeConfig: ScoringConfig = this.cloneConfig(this.defaultConfig);

  // ── Accès à la configuration ─────────────────────────────────
  getConfig(): ScoringConfig {
    return this.activeConfig;
  }

  setConfig(config: ScoringConfig): void {
    this.validateConfig(config);
    this.activeConfig = this.cloneConfig(config);
  }

  /** Met à jour le poids d'un critère à chaud */
  updateWeight(criterionId: string, weight: number): void {
    const criterion = this.activeConfig.criteria.find(c => c.id === criterionId);
    if (!criterion) throw new Error(`Critère introuvable : ${criterionId}`);
    criterion.weight = weight;
    this.normalizeWeights(); // rééquilibre automatiquement
  }

  /** Active ou désactive un critère à chaud */
  toggleCriterion(criterionId: string, enabled: boolean): void {
    const criterion = this.activeConfig.criteria.find(c => c.id === criterionId);
    if (criterion) {
      criterion.enabled = enabled;
      this.normalizeWeights();
    }
  }

  /** Ajoute un nouveau critère dynamiquement */
  addCriterion(criterion: ScoringCriterion): void {
    if (this.activeConfig.criteria.some(c => c.id === criterion.id)) {
      throw new Error(`Un critère avec l'id "${criterion.id}" existe déjà.`);
    }
    this.activeConfig.criteria.push(criterion);
    this.normalizeWeights();
  }

  /** Supprime un critère dynamiquement */
  removeCriterion(criterionId: string): void {
    this.activeConfig.criteria = this.activeConfig.criteria.filter(c => c.id !== criterionId);
    this.normalizeWeights();
  }

  // ── MOTEUR DE CALCUL PRINCIPAL ───────────────────────────────
  /**
   * Calcule le score global à partir des scores bruts fournis.
   * @param rawScores  ex: { quiz: 75, entretien: 60, coherence: 80, communication: 55 }
   */
  compute(rawScores: Record<string, number>): ScoringResult {
    const { criteria, rules, thresholds, formulaOverride } = this.activeConfig;
    const activeCriteria = criteria.filter(c => c.enabled);

    // 1. Sous-scores (0–100 par critère)
    const subScores: Record<string, number> = {};
    for (const c of activeCriteria) {
      subScores[c.id] = this.clamp(rawScores[c.id] ?? 0, 0, 100);
    }

    // 2. Vérification des règles d'élimination
    for (const rule of rules) {
      if (rule.type === 'elimination') {
        const score = subScores[rule.criterionId] ?? 0;
        if (score < rule.threshold) {
          return this.buildEliminatedResult(subScores, activeCriteria, rule.label, thresholds);
        }
      }
    }

    // 3. Calcul du score pondéré (formule personnalisable ou par défaut)
    let globalScore: number;
    const weightedContributions: Record<string, number> = {};

    if (formulaOverride) {
      globalScore = formulaOverride(subScores);
    } else {
      globalScore = 0;
      for (const c of activeCriteria) {
        const contrib = subScores[c.id] * c.weight;
        weightedContributions[c.id] = Math.round(contrib * 10) / 10;
        globalScore += contrib;
      }
      globalScore = Math.round(globalScore);
    }

    // 4. Application des bonus / pénalités
    for (const rule of rules) {
      if (rule.type === 'bonus' && (subScores[rule.criterionId] ?? 0) >= rule.threshold) {
        globalScore = this.clamp(globalScore + (rule.value ?? 0), 0, 100);
      }
      if (rule.type === 'penalty' && (subScores[rule.criterionId] ?? 0) < rule.threshold) {
        globalScore = this.clamp(globalScore + (rule.value ?? 0), 0, 100);
      }
    }

    globalScore = this.clamp(Math.round(globalScore), 0, 100);

    // 5. Détermination du niveau
    const level = thresholds.find(t => globalScore >= t.minScore && globalScore <= t.maxScore) ?? null;

    // 6. Génération des insights
    const insights = this.generateInsights(subScores, activeCriteria, globalScore);

    return {
      globalScore,
      subScores,
      level,
      insights,
      eliminated: false,
      weightedContributions,
    };
  }

  // ── GÉNÉRATION D'INSIGHTS ────────────────────────────────────
  private generateInsights(
    subScores: Record<string, number>,
    criteria: ScoringCriterion[],
    globalScore: number
  ): string[] {
    const insights: string[] = [];

    for (const c of criteria) {
      const score = subScores[c.id] ?? 0;
      if (score >= 85) insights.push(`✅ Excellent(e) ${c.label.toLowerCase()} (${score}/100)`);
      else if (score >= 70) insights.push(`👍 Bonne ${c.label.toLowerCase()} (${score}/100)`);
      else if (score >= 50) insights.push(`⚠️ ${c.label} moyenne — à améliorer (${score}/100)`);
      else insights.push(`❌ Faible ${c.label.toLowerCase()} — point critique (${score}/100)`);
    }

    // Insight global
    if (globalScore >= 75) insights.push('🏆 Profil expert — très fortement recommandé');
    else if (globalScore >= 50) insights.push('📈 Profil confirmé — recommandé avec suivi');
    else insights.push('🔰 Profil junior — nécessite accompagnement');

    return insights;
  }

  // ── UTILITAIRES ───────────────────────────────────────────────
  private buildEliminatedResult(
    subScores: Record<string, number>,
    criteria: ScoringCriterion[],
    reason: string,
    thresholds: ScoringThreshold[]
  ): ScoringResult {
    const wc: Record<string, number> = {};
    criteria.forEach(c => (wc[c.id] = 0));
    return {
      globalScore: 0,
      subScores,
      level: null,
      insights: [`🚫 Candidat éliminé : ${reason}`],
      eliminated: true,
      eliminationReason: reason,
      weightedContributions: wc,
    };
  }

  /** Rééquilibre les poids pour que leur somme = 1 */
  private normalizeWeights(): void {
    const active = this.activeConfig.criteria.filter(c => c.enabled);
    const total = active.reduce((sum, c) => sum + c.weight, 0);
    if (total === 0) return;
    active.forEach(c => (c.weight = Math.round((c.weight / total) * 100) / 100));
  }

  private validateConfig(config: ScoringConfig): void {
    const active = config.criteria.filter(c => c.enabled);
    const total = active.reduce((s, c) => s + c.weight, 0);
    if (Math.abs(total - 1) > 0.01) {
      console.warn(`[ScoringEngine] La somme des poids (${total}) n'est pas égale à 1. Normalisation automatique.`);
    }
  }

  private cloneConfig(config: ScoringConfig): ScoringConfig {
    return JSON.parse(JSON.stringify({ ...config, formulaOverride: undefined }));
  }

  private clamp(val: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, val));
  }
}
