import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { TransportRoutingModule } from './transport-routing.module';
import { TransportPageComponent } from './pages/transport-page/transport-page.component';
import { OptionServiceComponent } from './pages/option-service/option-service.component';
import { TripComponent } from './pages/trip/trip.component';
import { TransportAdComponent } from './pages/transport-ad/transport-ad.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [
    TransportPageComponent,
    OptionServiceComponent,
    TripComponent,
    TransportAdComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    ReactiveFormsModule,
    TransportRoutingModule
  ]
})
export class TransportModule { }
