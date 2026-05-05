import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DeliveryRoutingModule } from './delivery-routing.module';
import { DeliveryPageComponent } from './pages/delivery-page/delivery-page.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    DeliveryPageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DeliveryRoutingModule
  ]
})
export class DeliveryModule { }
