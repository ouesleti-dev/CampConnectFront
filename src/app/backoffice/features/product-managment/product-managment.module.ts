import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductManagmentRoutingModule } from './product-managment-routing.module';
import { ProductMComponent } from './page/product-m/product-m.component';
import { BaseChartDirective } from 'ng2-charts';

@NgModule({
  declarations: [
    ProductMComponent
  ],
  imports: [
    BaseChartDirective,
    CommonModule,
    ProductManagmentRoutingModule
  ]
})
export class ProductManagmentModule { }
