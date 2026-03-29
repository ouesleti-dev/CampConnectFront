import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RentMaintenanceRoutingModule } from './rent-maintenance-routing.module';
import { RentMaintenancePageComponent } from './pages/rent-maintenance-page/rent-maintenance-page.component';

@NgModule({
  imports: [
    CommonModule,
    RentMaintenanceRoutingModule
  ],
  declarations: [RentMaintenancePageComponent]
})
export class RentMaintenanceModule {}
