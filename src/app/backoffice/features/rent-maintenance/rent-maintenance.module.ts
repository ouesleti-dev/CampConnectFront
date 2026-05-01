import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RentMaintenanceRoutingModule } from './rent-maintenance-routing.module';
import { RentMaintenancePageComponent } from './pages/rent-maintenance-page/rent-maintenance-page.component';
import { EquipmentManagementComponent } from './pages/equipment-management/equipment-management.component';
import { RouterModule } from '@angular/router';
import { EquipmentStatsComponent } from './pages/equipment-stats/equipment-stats.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    RentMaintenanceRoutingModule
  ],
  declarations: [RentMaintenancePageComponent, EquipmentManagementComponent, EquipmentStatsComponent]
})
export class RentMaintenanceModule {}
