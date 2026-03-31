import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PartnershipAdminRoutingModule } from './partnership-admin-routing.module';
import { PartnershipAdminLayoutComponent } from './layout/partnership-admin-layout.component';
import { ChartWidgetComponent } from './components/chart-widget/chart-widget.component';
import { PaginatedDataTableComponent } from './components/paginated-data-table/paginated-data-table.component';
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
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
    PartnershipAdminLayoutComponent,
    ChartWidgetComponent,
    PaginatedDataTableComponent,
    PaDashboardPageComponent,
    PaPartnersPageComponent,
    PaPartnerDetailPageComponent,
    PaCampingsPageComponent,
    PaOffresPageComponent,
    PaContratsPageComponent,
    PaEntretiensPageComponent,
    PaRencontresPageComponent,
    PaQuizPageComponent,
    PaStatsPageComponent,
  ],
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, PartnershipAdminRoutingModule,ToastrModule.forRoot()],
})
export class PartnershipAdminModule {}
