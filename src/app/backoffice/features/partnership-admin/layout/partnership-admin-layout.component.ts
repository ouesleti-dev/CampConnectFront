import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../frontoffice/shared/services/auth.service';
import { environment } from '../../../../../environments/environment';
import { PartnershipStoreService } from '../services/partnership-store.service';

@Component({
  selector: 'app-partnership-admin-layout',
  templateUrl: './partnership-admin-layout.component.html',
  styleUrls: ['./partnership-admin-layout.component.css'],
})
export class PartnershipAdminLayoutComponent implements OnInit {
  readonly useBackendPartnership = environment.useBackendPartnership;

  readonly menu = [
    { label: 'Dashboard', path: '/admin/partnership-admin/dashboard', icon: '📊' },
    { label: 'Partenaires', path: '/admin/partnership-admin/partenaires', icon: '👤' },
    { label: 'Campings', path: '/admin/partnership-admin/campings', icon: '🏕️' },
    { label: 'Offres', path: '/admin/partnership-admin/offres', icon: '📄' },
    { label: 'Contrats', path: '/admin/partnership-admin/contrats', icon: '📑' },
    { label: 'Entretiens', path: '/admin/partnership-admin/entretiens', icon: '📅' },
    { label: 'Rencontres', path: '/admin/partnership-admin/rencontres', icon: '📞' },
    { label: 'Quiz', path: '/admin/partnership-admin/quiz', icon: '🧠' },
    { label: 'Statistiques', path: '/admin/partnership-admin/statistiques', icon: '📈' },
  ];

  constructor(
    private auth: AuthService,
    private store: PartnershipStoreService,
  ) {}

  ngOnInit(): void {
    if (environment.useBackendPartnership) {
      this.store.refreshFromBackend();
    }
  }

  /** Vide le cache navigateur des données partenariat puis resynchronise. */
  resyncFromServer(): void {
    if (!environment.useBackendPartnership) {
      return;
    }
    this.store.clearLocalCacheAndRefreshFromBackend();
  }

  get userEmail(): string {
    return this.auth.getEmail() || 'Admin';
  }

  get userRole(): string {
    return this.auth.getRole() || 'ROLE_ADMIN';
  }

  logout(): void {
    this.auth.logout();
    window.location.href = '/login';
  }
}
