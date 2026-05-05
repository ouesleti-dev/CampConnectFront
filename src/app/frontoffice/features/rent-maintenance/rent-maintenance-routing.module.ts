import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RentListComponent } from './pages/rent-list/rent-list.component';
import { MyEquipmentComponent } from './pages/my-equipment/my-equipment.component';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { RentMaintenancePageComponent } from './pages/rent-maintenance-page/rent-maintenance-page.component';
import { RentEquipmentComponent } from './pages/rent-equipment/rent-equipment.component';
import { MyRentalsComponent } from './pages/my-rentals/my-rentals.component';
import { ReceivedRentalsComponent } from './pages/received-rentals/received-rentals.component';


const routes: Routes = [
  {
    path: '',
    component: RentMaintenancePageComponent,  // ← composant parent
    children: [
      { path: '', component: RentListComponent }, // page par défaut
      { 
        path: 'my-equipment', 
        component: MyEquipmentComponent, 
        canActivate: [AuthGuard] 
      },
      { path: 'rent', component: RentEquipmentComponent },
{ path: 'my-rentals', component: MyRentalsComponent },
{ path: 'received', component: ReceivedRentalsComponent }
    ]
  }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RentMaintenanceRoutingModule { }
