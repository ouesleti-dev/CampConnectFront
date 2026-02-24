import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CampgroundsForumPageComponent } from './pages/campgrounds-forum-page/campgrounds-forum-page.component';

const routes: Routes = [
  {
    path: '',
    component: CampgroundsForumPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CampgroundsForumRoutingModule { }
