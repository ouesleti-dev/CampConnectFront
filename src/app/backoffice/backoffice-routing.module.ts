import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BackofficeLayoutComponent } from './backoffice-layout.component';

const routes: Routes = [
  {
    path: '',
    component: BackofficeLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users-management/users-management.module').then(m => m.UsersManagementModule)
      },
      {
        path: 'campgrounds',
        loadChildren: () => import('./features/campgrounds-management/campgrounds-management.module').then(m => m.CampgroundsManagementModule)
      },
      {
        path: 'product-management',
        loadChildren: () => import('./features/product-managment/product-managment.module').then(m => m.ProductManagmentModule)
      },
      {
        path: 'orders',
        loadChildren: () => import('./features/orders/orders.module').then(m => m.OrdersModule)
      },
      
      {
        path: 'reports',
        loadChildren: () => import('./features/reports/reports.module').then(m => m.ReportsModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('./features/settings/settings.module').then(m => m.SettingsModule)
      },
      {
        path: 'rent-maintenance',
        loadChildren: () => import('./features/rent-maintenance/rent-maintenance.module').then(m => m.RentMaintenanceModule)
      },
      {
        path: 'transport',
        loadChildren: () => import('./features/transport/transport.module').then(m => m.TransportModule)
      },
      {
        path: 'reclamation',
        loadChildren: () => import('./features/reclamation/reclamation.module').then(m => m.ReclamationModule)
      },
      {
        path: 'forum',
        loadChildren: () => import('./features/forum/forum.module').then(m => m.ForumModule)
      },
       {
        path: 'partnership-admin',
        loadChildren: () => import('./features/partnership-admin/partnership-admin.module').then(m => m.PartnershipAdminModule)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BackofficeRoutingModule { }
