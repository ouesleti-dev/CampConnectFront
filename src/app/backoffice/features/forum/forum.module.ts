import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ForumRoutingModule } from './forum-routing.module';
import { ForumPageComponent } from './pages/forum-page/forum-page.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ForumRoutingModule
  ],
  declarations: [ForumPageComponent]
})
export class ForumModule {}
