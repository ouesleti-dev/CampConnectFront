import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { TransportRoutingModule } from './transport-routing.module';
import { TransportPageComponent } from './pages/transport-page/transport-page.component';
import { OptionServiceComponent } from './pages/option-service/option-service.component';
import { TripComponent } from './pages/trip/trip.component';
import { TransportAdComponent } from './pages/transport-ad/transport-ad.component';
import { RecommendationComponent } from './pages/recommendation/recommendation.component';
import { AiTransportComponent } from './pages/ai-transport/ai-transport.component';
import { DemandAnalysisComponent } from './pages/demand-analysis/demand-analysis.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [
    TransportPageComponent,
    OptionServiceComponent,
    TripComponent,
    TransportAdComponent,
    RecommendationComponent,
    AiTransportComponent,
    DemandAnalysisComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    TransportRoutingModule
  ]
})
export class TransportModule { }
