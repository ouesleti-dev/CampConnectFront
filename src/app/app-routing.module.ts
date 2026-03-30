import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './frontoffice/shared/guards/auth.guard';
import { GuestGuard } from './frontoffice/shared/guards/guest.guard';
import { RoleGuard } from './frontoffice/shared/guards/role.guard';
import { ReservationsComponent } from './frontoffice/features/reservations/reservations.component';



const routes: Routes = [
 {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // ✅ Pages AUTH (seulement si NON connecté)
  {
    path: 'login',
    loadChildren: () => import('./frontoffice/features/auth/auth.module')
      .then(m => m.AuthModule),
    canActivate: [GuestGuard]
  },
  

  {
    path: 'home',
    loadChildren: () => import('./frontoffice/features/home/home.module')
      .then(m => m.HomeModule)
  },
  {
    path: 'campgrounds-forum',
    loadChildren: () => import('./frontoffice/features/campgrounds-forum/campgrounds-forum.module')
      .then(m => m.CampgroundsForumModule),
      canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./frontoffice/features/profile/profile.module')
      .then(m => m.ProfileModule),
      canActivate: [AuthGuard]
  },
  {
    path: 'reservations',
    component: ReservationsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'transport',
    loadChildren: () => import('./frontoffice/features/transport/transport.module')
      .then(m => m.TransportModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'marketplace',
    loadChildren: () => import('./frontoffice/features/marketplace/marketplace.module')
      .then(m => m.MarketplaceModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'rent-maintenance',
    loadChildren: () => import('./frontoffice/features/rent-maintenance/rent-maintenance.module')
      .then(m => m.RentMaintenanceModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'partnerships',
    loadChildren: () => import('./frontoffice/features/partnerships/partnerships.module')
      .then(m => m.PartnershipsModule),
    canActivate: [AuthGuard]
  },


  {
    path: 'delivery',
    loadChildren: () => import('./frontoffice/features/delivery/delivery.module')
      .then(m => m.DeliveryModule),
    canActivate: [AuthGuard]
  },


  {
    path: 'admin',
    loadChildren: () => import('./backoffice/backoffice.module')
      .then(m => m.BackofficeModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ROLE_ADMIN' }
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
