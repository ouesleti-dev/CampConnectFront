import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CampgroundsManagementRoutingModule } from './campgrounds-management-routing.module';
import { CampgroundsManagementPageComponent } from './pages/campgrounds-management-page/campgrounds-management-page.component';


@NgModule({
  declarations: [
    CampgroundsManagementPageComponent
  ],
  imports: [
    CommonModule,
    CampgroundsManagementRoutingModule
  ]
})
export class CampgroundsManagementModule { }
