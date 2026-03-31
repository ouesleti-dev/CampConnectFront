import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PartnershipsRoutingModule } from './partnerships-routing.module';
import { PartnershipsPageComponent } from './pages/partnerships-page/partnerships-page.component';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
    PartnershipsPageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PartnershipsRoutingModule,
    ToastrModule
  ]
})
export class PartnershipsModule { }
