import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartnershipsRoutingModule } from './partnerships-routing.module';
import { PartnershipsPageComponent } from './pages/partnerships-page/partnerships-page.component';

@NgModule({
  imports: [
    CommonModule,
    PartnershipsRoutingModule
  ],
  declarations: [PartnershipsPageComponent]
})
export class PartnershipsModule {}
