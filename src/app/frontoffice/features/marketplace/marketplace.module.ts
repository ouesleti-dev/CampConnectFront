import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarketplaceRoutingModule } from './marketplace-routing.module';
import { MarketplacePageComponent } from './pages/marketplace-page/marketplace-page.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthInterceptor } from '../../shared/interceptors/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';



@NgModule({
  declarations: [
    MarketplacePageComponent,
    
  ],
  imports: [
     CommonModule,
    FormsModule,           
    ReactiveFormsModule,  
    RouterModule, 
    MarketplaceRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
})
export class MarketplaceModule { }
