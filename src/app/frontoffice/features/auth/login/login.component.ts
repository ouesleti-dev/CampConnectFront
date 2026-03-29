// src/app/frontoffice/features/auth/login/login.component.ts

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        // ✅ Rediriger selon le rôle
        switch (response.role) {
          case 'ROLE_ADMIN':
            this.router.navigate(['/backoffice/dashboard']);
            break;
          case 'ROLE_CAMPOWNER':
            this.router.navigate(['/backoffice/campgrounds-management']);
            break;
          case 'ROLE_CAMPER':
            this.router.navigate(['/home']);
            break;
          case 'ROLE_DELIVERYPERSON':
            this.router.navigate(['/delivery']);
            break;
          case 'ROLE_PARTNER':
            this.router.navigate(['/partnerships']);
            break;
          default:
            this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Email or password is incorrect. Please try again.';
      }
    });
  }
}