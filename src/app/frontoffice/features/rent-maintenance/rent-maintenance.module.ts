import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RentMaintenanceRoutingModule } from './rent-maintenance-routing.module';
import { RentMaintenancePageComponent } from './pages/rent-maintenance-page/rent-maintenance-page.component';


@NgModule({
  declarations: [
    RentMaintenancePageComponent
  ],
  imports: [
    CommonModule,
    RentMaintenanceRoutingModule
  ]
})
export class RentMaintenanceModule { }
