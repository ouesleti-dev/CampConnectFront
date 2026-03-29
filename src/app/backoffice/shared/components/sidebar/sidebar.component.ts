import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  menuItems = [
    { label: 'Dashboard Overview', route: '/admin/dashboard' },
    { label: 'Users Management', route: '/admin/users' },
    { label: 'Campgrounds Management', route: '/admin/campgrounds' },
    { label: 'Product Management', route: '/admin/product-management' },
    { label: 'Orders & Deliveries', route: '/admin/orders' },
     { label: 'Rent & Maintenance', route: '/admin/rent-maintenance' },
      { label: 'Partnership', route: '/admin/partnerships' },
      { label: 'Transport', route: '/admin/transport' },
      { label: 'Reclamation', route: '/admin/reclamation' },
      { label: 'Forum', route: '/admin/forum' },
      { label: 'Reports & Analytics', route: '/admin/reports' },
    { label: 'Settings', route: '/admin/settings' }
    ];

  constructor(private router: Router) {}

  navigate(route: string) {
    this.router.navigate([route]);
  }
}
