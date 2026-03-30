import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CampgroundsForumRoutingModule } from './campgrounds-forum-routing.module';
import { CampgroundsForumPageComponent } from './pages/campgrounds-forum-page/campgrounds-forum-page.component';


@NgModule({
  declarations: [
    CampgroundsForumPageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    CampgroundsForumRoutingModule
  ]
})
export class CampgroundsForumModule { }
