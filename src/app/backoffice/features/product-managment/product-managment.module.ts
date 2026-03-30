import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductManagmentRoutingModule } from './product-managment-routing.module';
import { ProductMComponent } from './page/product-m/product-m.component';


@NgModule({
  declarations: [
    ProductMComponent
  ],
  imports: [
    CommonModule,
    ProductManagmentRoutingModule
  ]
})
export class ProductManagmentModule { }
