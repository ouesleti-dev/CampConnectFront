import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersManagementRoutingModule } from './users-management-routing.module';
import { UsersManagementPageComponent } from './pages/users-management-page/users-management-page.component';


@NgModule({
  declarations: [
    UsersManagementPageComponent
  ],
  imports: [
    CommonModule,
    UsersManagementRoutingModule
  ]
})
export class UsersManagementModule { }
