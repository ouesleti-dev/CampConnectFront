import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BackofficeRoutingModule } from './backoffice-routing.module';
import { BackofficeLayoutComponent } from './backoffice-layout.component';
import { BackofficeSharedModule } from './shared/shared.module';
import { BaseChartDirective } from 'ng2-charts';



@NgModule({
  declarations: [
    
    BackofficeLayoutComponent,
    
  ],
  imports: [
    BaseChartDirective,
    CommonModule,
    BackofficeRoutingModule,
    BackofficeSharedModule
  ]
})
export class BackofficeModule { }
