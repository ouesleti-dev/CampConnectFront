import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BackofficeRoutingModule } from './backoffice-routing.module';
import { BackofficeLayoutComponent } from './backoffice-layout.component';
import { BackofficeSharedModule } from './shared/shared.module';



@NgModule({
  declarations: [
    BackofficeLayoutComponent,
    
  ],
  imports: [
    CommonModule,
    BackofficeRoutingModule,
    BackofficeSharedModule
  ]
})
export class BackofficeModule { }
