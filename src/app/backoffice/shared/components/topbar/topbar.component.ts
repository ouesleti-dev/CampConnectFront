import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../frontoffice/shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {

  currentUser: string = '';
  userRole: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getEmail() || 'Admin User';
    this.userRole = this.authService.getRole() || 'Administrator';
  }

  toggleNotifications(): void {
    this.toast.info('Feature: Notifications');
  }

  toggleProfile(): void {
    this.toast.info('Feature: User Profile');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.toast.success('Logged out successfully');
  }
}