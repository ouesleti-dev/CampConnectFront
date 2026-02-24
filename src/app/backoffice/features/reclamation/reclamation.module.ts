import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReclamationRoutingModule } from './reclamation-routing.module';
import { ReclamationPageComponent } from './pages/reclamation-page/reclamation-page.component';

@NgModule({
  imports: [
    CommonModule,
    ReclamationRoutingModule
  ],
  declarations: [ReclamationPageComponent]
})
export class ReclamationModule {}
