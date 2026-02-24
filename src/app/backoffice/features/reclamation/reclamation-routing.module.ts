import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReclamationPageComponent } from './pages/reclamation-page/reclamation-page.component';

const routes: Routes = [
  {
    path: '',
    component: ReclamationPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReclamationRoutingModule { }
