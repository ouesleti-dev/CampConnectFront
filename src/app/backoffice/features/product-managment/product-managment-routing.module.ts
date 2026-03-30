import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductMComponent } from './page/product-m/product-m.component';

const routes: Routes = [
  {
    path: '',
    component: ProductMComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductManagmentRoutingModule { }
