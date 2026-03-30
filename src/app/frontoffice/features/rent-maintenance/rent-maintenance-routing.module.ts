import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RentMaintenancePageComponent } from './pages/rent-maintenance-page/rent-maintenance-page.component';

const routes: Routes = [
  {
  path: '',
  component: RentMaintenancePageComponent
  }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RentMaintenanceRoutingModule { }
