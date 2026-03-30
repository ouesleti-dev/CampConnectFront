import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PartnershipsPageComponent } from './pages/partnerships-page/partnerships-page.component';

const routes: Routes = [
   {
    path: '',
    component: PartnershipsPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PartnershipsRoutingModule { }
