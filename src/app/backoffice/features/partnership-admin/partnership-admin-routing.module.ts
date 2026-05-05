import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PartnershipAdminLayoutComponent } from './layout/partnership-admin-layout.component';
import { PaDashboardPageComponent } from './pages/pa-dashboard-page/pa-dashboard-page.component';
import { PaPartnersPageComponent } from './pages/pa-partners-page/pa-partners-page.component';
import { PaPartnerDetailPageComponent } from './pages/pa-partner-detail-page/pa-partner-detail-page.component';
import { PaCampingsPageComponent } from './pages/pa-campings-page/pa-campings-page.component';
import { PaOffresPageComponent } from './pages/pa-offres-page/pa-offres-page.component';
import { PaContratsPageComponent } from './pages/pa-contrats-page/pa-contrats-page.component';
import { PaEntretiensPageComponent } from './pages/pa-entretiens-page/pa-entretiens-page.component';
import { PaRencontresPageComponent } from './pages/pa-rencontres-page/pa-rencontres-page.component';
import { PaQuizPageComponent } from './pages/pa-quiz-page/pa-quiz-page.component';
import { PaStatsPageComponent } from './pages/pa-stats-page/pa-stats-page.component';

const routes: Routes = [
  {
    path: '',
    component: PartnershipAdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'statistiques', pathMatch: 'full' },
      { path: 'partenaires', component: PaPartnersPageComponent },
      { path: 'partenaires/:id', component: PaPartnerDetailPageComponent },
      { path: 'campings', component: PaCampingsPageComponent },
      { path: 'offres', component: PaOffresPageComponent },
      { path: 'contrats', component: PaContratsPageComponent },
      { path: 'entretiens', component: PaEntretiensPageComponent },
      { path: 'rencontres', component: PaRencontresPageComponent },
      { path: 'quiz', component: PaQuizPageComponent },
      { path: 'statistiques', component: PaStatsPageComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PartnershipAdminRoutingModule {}
