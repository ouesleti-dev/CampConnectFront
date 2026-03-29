import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-call-to-action',
  templateUrl: './call-to-action.component.html',
  styleUrl: './call-to-action.component.css'
})
export class CallToActionComponent {
  constructor(private router: Router) {}

  navigateToExplore(): void {
    this.router.navigate(['/explore']);
  }

  navigateToSignup(): void {
    // Navigate to signup page
    console.log('Navigate to signup');
  }
}
