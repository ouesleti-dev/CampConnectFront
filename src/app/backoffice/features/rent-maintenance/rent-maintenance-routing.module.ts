import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RentMaintenancePageComponent } from './pages/rent-maintenance-page/rent-maintenance-page.component';
import { EquipmentManagementComponent } from './pages/equipment-management/equipment-management.component';

const routes: Routes = [
 {
    path: '',
    component: RentMaintenancePageComponent
  },
  {
    path: 'equipment',       
    component: EquipmentManagementComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RentMaintenanceRoutingModule { }
