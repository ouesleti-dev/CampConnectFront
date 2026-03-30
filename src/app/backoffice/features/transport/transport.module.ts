import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransportRoutingModule } from './transport-routing.module';
import { TransportPageComponent } from './pages/transport-page/transport-page.component';

@NgModule({
  imports: [
    CommonModule,
    TransportRoutingModule
  ],
  declarations: [TransportPageComponent]
})
export class TransportModule {}
