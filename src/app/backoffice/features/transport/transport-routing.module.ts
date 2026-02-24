import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransportPageComponent } from './pages/transport-page/transport-page.component';

const routes: Routes = [
  {
    path: '',
    component: TransportPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransportRoutingModule { }
