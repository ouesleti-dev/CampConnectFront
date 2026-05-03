import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransportPageComponent } from './pages/transport-page/transport-page.component';
import { OptionServiceComponent } from './pages/option-service/option-service.component';
import { TripComponent } from './pages/trip/trip.component';
import { TransportAdComponent } from './pages/transport-ad/transport-ad.component';
import { RecommendationComponent } from './pages/recommendation/recommendation.component';
import { AiTransportComponent } from './pages/ai-transport/ai-transport.component';
import { DemandAnalysisComponent } from './pages/demand-analysis/demand-analysis.component';
import { AuthGuard } from '../../shared/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: TransportPageComponent
  },
  {
    path: 'options',
    component: OptionServiceComponent
  },
  {
    path: 'trips',
    component: TripComponent
  },
  {
    path: 'transport-ads',
    component: TransportAdComponent
  },
  {
    path: 'recommendations',
    component: RecommendationComponent
  },
  {
    path: 'ai',
    component: AiTransportComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'demand-analysis',
    component: DemandAnalysisComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransportRoutingModule { }
