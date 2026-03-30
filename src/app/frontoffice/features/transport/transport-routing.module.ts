import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransportPageComponent } from './pages/transport-page/transport-page.component';
import { OptionServiceComponent } from './pages/option-service/option-service.component';
import { TripComponent } from './pages/trip/trip.component';
import { TransportAdComponent } from './pages/transport-ad/transport-ad.component';

const routes: Routes = [
  {
    path: '',
    component: TransportPageComponent
  },
  {
    path: 'options',
    component: OptionServiceComponent
  },
  {
    path: 'trips',
    component: TripComponent
  },
  {
    path: 'transport-ads',
    component: TransportAdComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransportRoutingModule { }
