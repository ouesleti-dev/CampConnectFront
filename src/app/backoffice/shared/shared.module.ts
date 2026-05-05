import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { NotificationBellComponent } from '../features/partnership-admin/components/notification-bell/notification-bell.component';

@NgModule({
  declarations: [
    SidebarComponent,
    TopbarComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    NotificationBellComponent
  ],
  exports: [
    SidebarComponent,
    TopbarComponent
  ]
})
export class BackofficeSharedModule { }
