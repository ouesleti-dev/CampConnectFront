import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RentMaintenanceRoutingModule } from './rent-maintenance-routing.module';
import { RentMaintenancePageComponent } from './pages/rent-maintenance-page/rent-maintenance-page.component';
import { RentListComponent } from './pages/rent-list/rent-list.component';
import { MyEquipmentComponent } from './pages/my-equipment/my-equipment.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '../../shared/interceptors/auth.interceptor';
import { RentEquipmentComponent } from './pages/rent-equipment/rent-equipment.component';
import { MyRentalsComponent } from './pages/my-rentals/my-rentals.component';
import { ReceivedRentalsComponent } from './pages/received-rentals/received-rentals.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EquipmentSearchComponent } from './pages/equipment-search/equipment-search.component';
import { AnalyticsDashboardComponent } from './pages/analyticsdashboard/analyticsdashboard.component';
import { StoryBarComponent } from './pages/story-bar/story-bar.component';




@NgModule({
  declarations: [
    RentMaintenancePageComponent,
    RentListComponent,
    MyEquipmentComponent,
    RentEquipmentComponent,
    MyRentalsComponent,
    ReceivedRentalsComponent,
    EquipmentSearchComponent,
    AnalyticsDashboardComponent,
    StoryBarComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    RentMaintenanceRoutingModule,
    ReactiveFormsModule,
    FormsModule,
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
