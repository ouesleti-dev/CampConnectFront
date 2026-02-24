import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HomeRoutingModule } from './home-routing.module';
import { CallToActionComponent } from './components/call-to-action/call-to-action.component';
import { FeaturedSectionComponent } from './components/featured-section/featured-section.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { ServicesSectionComponent } from './components/services-section/services-section.component';
import { HomePageComponent } from './pages/home-page/home-page.component';


@NgModule({
  declarations: [
    CallToActionComponent,
    FeaturedSectionComponent,
    HeroSectionComponent,
    ServicesSectionComponent,
    HomePageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HomeRoutingModule
  ]
})
export class HomeModule { }
