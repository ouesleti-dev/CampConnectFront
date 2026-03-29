import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CampgroundsManagementPageComponent } from './pages/campgrounds-management-page/campgrounds-management-page.component';

const routes: Routes = [
  {
    path: '',
    component: CampgroundsManagementPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CampgroundsManagementRoutingModule { }
