import { Component, OnInit } from '@angular/core';
import { CampingService } from '../../../../../frontoffice/shared/services/camping.service';
import { ActivityService } from '../../../../../frontoffice/shared/services/activity.service';
import { EventService } from '../../../../../frontoffice/shared/services/event.service';
import { CampingDTO, ActivityDTO, EventDTO } from '../../../../../frontoffice/shared/models/camping-forum.models';

@Component({
  selector: 'app-campgrounds-management-page',
  templateUrl: './campgrounds-management-page.component.html',
  styleUrls: ['./campgrounds-management-page.component.css']
})
export class CampgroundsManagementPageComponent implements OnInit {

  activeTab: 'campings' | 'activities' | 'events' = 'campings';

  // Campings
  campings: CampingDTO[] = [];
  loadingCampings = false;

  // Activités
  activities: ActivityDTO[]         = [];
  filteredActivities: ActivityDTO[] = [];
  loadingActivities                 = false;
  selectedCampingId: number | null  = null;

  // Events
  events: EventDTO[]               = [];
  filteredEvents: EventDTO[]        = [];
  loadingEvents                     = false;
  selectedCampingIdForEvents: number | null = null;

  successMessage = '';
  errorMessage   = '';

  constructor(
    private campingService:  CampingService,
    private activityService: ActivityService,
    private eventService:    EventService
  ) {}

  ngOnInit(): void {
    this.loadCampings();
    this.loadActivities();
    this.loadEvents();
  }

  // ── Tab ───────────────────────────────────────────────────
  switchTab(tab: 'campings' | 'activities' | 'events'): void {
    this.activeTab = tab;
    this.selectedCampingId         = null;
    this.selectedCampingIdForEvents = null;
    this.filteredActivities        = this.activities;
    this.filteredEvents            = this.events;
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
    if (!confirm('Supprimer cet événement ? Tous ses posts et commentaires seront supprimés.')) return;
    this.eventService.delete(id).subscribe({
      next: () => {
        this.events         = this.events.filter((e: EventDTO) => e.id !== id);
        this.filteredEvents = this.filteredEvents.filter((e: EventDTO) => e.id !== id);
        this.showSuccess('Événement supprimé.');
      },
      error: (err: any) => this.showError(err.error?.error || 'Erreur suppression événement.')
    });
  }

  // ── Helpers ───────────────────────────────────────────────
  getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      'OPEN': 'badge-active', 'ACTIVE': 'badge-active',
      'CLOSED': 'badge-inactive', 'INACTIVE': 'badge-inactive',
      'MAINTENANCE': 'badge-maintenance',
      'PLANNED': 'badge-planned', 'ONGOING': 'badge-ongoing',
      'COMPLETED': 'badge-completed', 'CANCELLED': 'badge-inactive'
    };
    return map[status] || 'badge-default';
  }

  getDifficultyBadgeClass(difficulty: string): string {
    const map: Record<string, string> = {
      'EASY': 'badge-easy', 'MEDIUM': 'badge-medium', 'HARD': 'badge-hard'
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