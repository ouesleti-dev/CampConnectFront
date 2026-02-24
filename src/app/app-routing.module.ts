import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
  path: 'home',
    loadChildren: () => import('./frontoffice/features/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'transport',
    loadChildren: () => import('./frontoffice/features/transport/transport.module').then(m => m.TransportModule)
  },
  {
    path: 'marketplace',
    loadChildren: () => import('./frontoffice/features/marketplace/marketplace.module').then(m => m.MarketplaceModule)
  },
  {
    path: 'campgrounds-forum',
    loadChildren: () => import('./frontoffice/features/campgrounds-forum/campgrounds-forum.module').then(m => m.CampgroundsForumModule)
  },
  {
    path: 'rent-maintenance',
    loadChildren: () => import('./frontoffice/features/rent-maintenance/rent-maintenance.module').then(m => m.RentMaintenanceModule)
  },
  {
    path: 'delivery',
    loadChildren: () => import('./frontoffice/features/delivery/delivery.module').then(m => m.DeliveryModule)
  },
  {
    path: 'partnerships',
    loadChildren: () => import('./frontoffice/features/partnerships/partnerships.module').then(m => m.PartnershipsModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./backoffice/backoffice.module').then(m => m.BackofficeModule)
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'top',
    anchorScrolling: 'enabled',
    onSameUrlNavigation: 'reload'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {
  
 }
