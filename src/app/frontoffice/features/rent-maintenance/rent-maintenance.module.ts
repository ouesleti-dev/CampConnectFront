import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RentMaintenanceRoutingModule } from './rent-maintenance-routing.module';
import { RentMaintenancePageComponent } from './pages/rent-maintenance-page/rent-maintenance-page.component';
import { RentListComponent } from './pages/rent-list/rent-list.component';
import { MyEquipmentComponent } from './pages/my-equipment/my-equipment.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '../../shared/interceptors/auth.interceptor';


@NgModule({
  declarations: [
    RentMaintenancePageComponent,
    RentListComponent,
    MyEquipmentComponent
  ],
  imports: [
    CommonModule,
    RentMaintenanceRoutingModule,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
})
export class RentMaintenanceModule { }
