import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './frontoffice/shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http'; // ✅ HttpClientModule
import { AuthInterceptor } from './frontoffice/shared/interceptors/auth.interceptor';

import { ReservationsComponent } from './frontoffice/features/reservations/reservations.component';
import { ToastrModule } from 'ngx-toastr';
import { ChartWidgetComponent } from './shared/components/chart-widget/chart-widget.component';


import { BaseChartDirective } from 'ng2-charts';

@NgModule({
  declarations: [
    AppComponent,
    ReservationsComponent,
    ChartWidgetComponent
  ],
  imports: [

    HttpClientModule,

   BaseChartDirective,

    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    SharedModule,
    RouterModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-end',
      timeOut: 3500,
      preventDuplicates: true
    })
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }