import { Component, OnInit } from '@angular/core';
import { CampingService } from '../../../../../frontoffice/shared/services/camping.service';
import { ActivityService } from '../../../../../frontoffice/shared/services/activity.service';
import { EventService } from '../../../../../frontoffice/shared/services/event.service';
import { StatsService } from '../../../../../frontoffice/shared/services/stats.service';
import { MlPredictionService } from '../../../../../frontoffice/shared/services/ml-prediction.service';
import { ParticipationService } from '../../../../../frontoffice/shared/services/participation.service';
import {
  CampingDTO, ActivityDTO, EventDTO,
  EventStatsDTO, CampingRankingDTO,
  ParticipationDTO, DropoutFeaturesDTO, DropoutPredictionDTO
} from '../../../../../frontoffice/shared/models/camping-forum.models';

@Component({
  selector: 'app-campgrounds-management-page',
  templateUrl: './campgrounds-management-page.component.html',
  styleUrls: ['./campgrounds-management-page.component.css']
})
export class CampgroundsManagementPageComponent implements OnInit {

  activeTab: 'campings' | 'activities' | 'events' | 'stats' = 'campings';

  // Campings
  campings: CampingDTO[] = [];
  loadingCampings        = false;

  // Activités
  activities: ActivityDTO[]         = [];
  filteredActivities: ActivityDTO[] = [];
  loadingActivities                 = false;
  selectedCampingId: number | null  = null;

  // Events
  events: EventDTO[]                        = [];
  filteredEvents: EventDTO[]                = [];
  loadingEvents                             = false;
  selectedCampingIdForEvents: number | null = null;

  // Stats
  campingRanking: CampingRankingDTO[]      = [];
  selectedEventStats: EventStatsDTO | null = null;
  loadingStats                             = false;
  selectedEventIdForStats: number | null   = null;

  // Participants + Dropout
  participantsByActivity: ParticipationDTO[]           = [];
  dropoutScores: Map<number, DropoutPredictionDTO>     = new Map();
  loadingParticipants                                  = false;
  selectedActivityId: number | null                    = null;

  // Messages
  successMessage = '';
  errorMessage   = '';

  constructor(
    private campingService:       CampingService,
    private activityService:      ActivityService,
    private eventService:         EventService,
    private statsService:         StatsService,         // ⭐ virgule manquante corrigée
    private mlService:            MlPredictionService,
    private participationService: ParticipationService
  ) {}

  ngOnInit(): void {
    this.loadCampings();
    this.loadActivities();
    this.loadEvents();
  }

  // ── Tab ───────────────────────────────────────────────────
  switchTab(tab: 'campings' | 'activities' | 'events' | 'stats'): void {
    this.activeTab                  = tab;
    this.selectedCampingId          = null;
    this.selectedCampingIdForEvents = null;
    this.filteredActivities         = this.activities;
    this.filteredEvents             = this.events;
    // Reset participants quand on change d'onglet
    this.selectedActivityId         = null;
    this.participantsByActivity     = [];
    this.dropoutScores              = new Map();

    if (tab === 'stats') this.loadCampingRanking();
  }

  // ── Campings ──────────────────────────────────────────────
  loadCampings(): void {
    this.loadingCampings = true;
    this.campingService.getAll().subscribe({
      next: (data: CampingDTO[]) => {
        this.campings        = data;
        this.loadingCampings = false;
      },
      error: () => {
        this.showError('Erreur lors du chargement des campings.');
        this.loadingCampings = false;
      }
    });
  }

  deleteCamping(id: number): void {
    if (!confirm('Supprimer ce camping ?')) return;
    this.campingService.delete(id).subscribe({
      next: () => {
        this.campings = this.campings.filter((c: CampingDTO) => c.campingId !== id);
        this.loadActivities();
        this.loadEvents();
        this.showSuccess('Camping supprimé.');
      },
      error: (err: any) => this.showError(err.error?.error || 'Erreur suppression camping.')
    });
  }

  // ── Activités ─────────────────────────────────────────────
  loadActivities(): void {
    this.loadingActivities = true;
    this.activityService.getAll().subscribe({
      next: (data: ActivityDTO[]) => {
        this.activities         = data;
        this.filteredActivities = data;
        this.loadingActivities  = false;
      },
      error: () => {
        this.showError('Erreur lors du chargement des activités.');
        this.loadingActivities = false;
      }
    });
  }

  onCampingFilterChange(): void {
    this.filteredActivities = this.selectedCampingId
      ? this.activities.filter((a: ActivityDTO) => a.campingId === this.selectedCampingId)
      : this.activities;
  }

  deleteActivity(id: number): void {
    if (!confirm('Supprimer cette activité ?')) return;
    this.activityService.delete(id).subscribe({
      next: () => {
        this.activities         = this.activities.filter((a: ActivityDTO) => a.id !== id);
        this.filteredActivities = this.filteredActivities.filter((a: ActivityDTO) => a.id !== id);
        // Reset si l'activité supprimée était sélectionnée
        if (this.selectedActivityId === id) {
          this.selectedActivityId     = null;
          this.participantsByActivity = [];
          this.dropoutScores          = new Map();
        }
        this.showSuccess('Activité supprimée.');
      },
      error: (err: any) => this.showError(err.error?.error || 'Erreur suppression activité.')
    });
  }

  // ── Events ────────────────────────────────────────────────
  loadEvents(): void {
    this.loadingEvents = true;
    this.eventService.getAll().subscribe({
      next: (data: EventDTO[]) => {
        this.events         = data;
        this.filteredEvents = data;
        this.loadingEvents  = false;
      },
      error: () => {
        this.showError('Erreur lors du chargement des événements.');
        this.loadingEvents = false;
      }
    });
  }

  onCampingFilterChangeForEvents(): void {
    this.filteredEvents = this.selectedCampingIdForEvents
      ? this.events.filter((e: EventDTO) => e.campingId === this.selectedCampingIdForEvents)
      : this.events;
  }

  deleteEvent(id: number): void {
    if (!confirm('Supprimer cet événement ?')) return;
    this.eventService.delete(id).subscribe({
      next: () => {
        this.events         = this.events.filter((e: EventDTO) => e.id !== id);
        this.filteredEvents = this.filteredEvents.filter((e: EventDTO) => e.id !== id);
        this.showSuccess('Événement supprimé.');
      },
      error: (err: any) => this.showError(err.error?.error || 'Erreur suppression événement.')
    });
  }

  // ── Stats ─────────────────────────────────────────────────
  loadCampingRanking(): void {
    this.loadingStats = true;
    this.statsService.getCampingRanking().subscribe({
      next: (data: CampingRankingDTO[]) => {
        this.campingRanking = data;
        this.loadingStats   = false;
      },
      error: () => {
        this.showError('Erreur chargement statistiques.');
        this.loadingStats = false;
      }
    });
  }

  onEventStatsChange(): void {
    if (!this.selectedEventIdForStats) return;
    this.statsService.getEventStats(this.selectedEventIdForStats).subscribe({
      next: (data: EventStatsDTO) => { this.selectedEventStats = data; },
      error: () => this.showError('Erreur chargement stats événement.')
    });
  }

  // ── Participants + Dropout ML ──────────────────────────────
  loadParticipantsByActivity(activityId: number): void {
    // Toggle : si on clique sur la même activité, on ferme
    if (this.selectedActivityId === activityId) {
      this.selectedActivityId     = null;
      this.participantsByActivity = [];
      this.dropoutScores          = new Map();
      return;
    }

    this.selectedActivityId  = activityId;
    this.loadingParticipants = true;
    this.dropoutScores       = new Map();

    this.participationService.getByActivity(activityId).subscribe({
      next: (data: ParticipationDTO[]) => {
        this.participantsByActivity = data;
        this.loadingParticipants    = false;
        // Prédire le dropout pour chaque participant
        data.forEach((p: ParticipationDTO) => this.predictDropoutForParticipant(p));
      },
      error: () => {
        this.showError('Erreur chargement participants.');
        this.loadingParticipants = false;
      }
    });
  }

  predictDropoutForParticipant(p: ParticipationDTO): void {
    // ⭐ Features calculées depuis les données disponibles
    const activity = this.activities.find((a: ActivityDTO) => a.id === this.selectedActivityId);
    const diffScore = activity
      ? ({ 'EASY': 1, 'MEDIUM': 2, 'HARD': 3 } as Record<string, number>)[activity.difficulty] ?? 2
      : 2;

    const features: DropoutFeaturesDTO = {
      cancel_rate_user:       p.status === 'CANCELLED' ? 0.8 : 0.2,
      activity_difficulty:    diffScore,
      nb_participations_user: 3,   // valeur par défaut — idéalement depuis la BD
      month:                  new Date().getMonth() + 1
    };

    this.mlService.predictDropout(features).subscribe({
      next: (result: DropoutPredictionDTO) => {
        this.dropoutScores.set(p.id, result);
      },
      error: () => {
        // En cas d'erreur FastAPI, affiche LOW par défaut
        this.dropoutScores.set(p.id, {
          dropout_probability: 0,
          risk_level: 'LOW'
        });
      }
    });
  }

  getDropoutScore(participationId: number): DropoutPredictionDTO | null {
    return this.dropoutScores.get(participationId) || null;
  }

  getRiskClass(risk: string): string {
    const map: Record<string, string> = {
      'LOW':    'risk-low',
      'MEDIUM': 'risk-medium',
      'HIGH':   'risk-high'
    };
    return map[risk] || '';
  }

  // ── Helpers ───────────────────────────────────────────────
  getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      'OPEN':        'badge-active',
      'ACTIVE':      'badge-active',
      'CLOSED':      'badge-inactive',
      'INACTIVE':    'badge-inactive',
      'MAINTENANCE': 'badge-maintenance',
      'PLANNED':     'badge-planned',
      'ONGOING':     'badge-ongoing',
      'COMPLETED':   'badge-completed',
      'CANCELLED':   'badge-inactive'
    };
    return map[status] || 'badge-default';
  }

  getDifficultyBadgeClass(difficulty: string): string {
    const map: Record<string, string> = {
      'EASY':   'badge-easy',
      'MEDIUM': 'badge-medium',
      'HARD':   'badge-hard'
    };
    return map[difficulty] || 'badge-default';
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }

  private showError(msg: string): void {
    this.errorMessage = msg;
    setTimeout(() => this.errorMessage = '', 4000);
  }
}