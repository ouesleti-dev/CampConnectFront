import { Component, HostListener, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service'; // ✅ Ajoutez cet import

interface NavItem {
  label: string;
  route: string;
  active?: boolean;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {

  isScrolled = false;
  isMobileMenuOpen = false;

  navItems: NavItem[] = [
    { label: 'Home', route: '/home' },
    { label: 'Campgrounds & Forum', route: '/campgrounds-forum' },
    { label: 'Transport', route: '/transport' },
    { label: ' Reservations', route: '/reservations' },
    { label: 'Marketplace', route: '/marketplace' },
    { label: 'Rent & Maintenance', route: '/rent-maintenance' },
    { label: 'Delivery', route: '/delivery' },
    { label: 'Partnerships', route: '/partnerships' },
    { label: 'Profile', route: '/profile' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService  // ✅ Injectez AuthService
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateActiveState();
        this.isMobileMenuOpen = false;
      });

    this.updateActiveState();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 20;
  }

  updateActiveState(): void {
    const currentRoute = this.router.url.split('?')[0];
    this.navItems.forEach(item => {
      item.active = currentRoute === item.route || currentRoute.startsWith(item.route + '/');
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.closeMobileMenu();
  }

  // ✅ Méthodes Auth
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  getEmail(): string {
    return this.authService.getEmail() || '';
  }

  getRole(): string {
    return this.authService.getRole() || '';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
