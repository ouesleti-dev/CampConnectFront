import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  registerForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  roles = [
    { value: 'CAMPER', label: 'Camper' },
    { value: 'CAMPOWNER', label: 'Camp Owner' },
    { value: 'DELIVERYPERSON', label: 'Delivery Person' },
    { value: 'PARTNER', label: 'Partner' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName:  ['', Validators.required],
      email:     ['', [Validators.required, Validators.email]],
      password:  ['', [Validators.required, Validators.minLength(6)]],
      phone:     ['', Validators.required],
      role:      ['CAMPER', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.registerForm.value;

    // ✅ Étape 1 : Register
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        // ✅ Étape 2 : Login automatique
        this.authService.login({ email, password }).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.redirectByRole(response.role);
          },
          error: () => {
            this.isLoading = false;
            this.router.navigate(['/login']);
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Registration failed. Please try again.';
      }
    });
  }

  private redirectByRole(role: string): void {
    switch (role) {
      case 'ROLE_ADMIN':
        this.router.navigate(['/admin']);
        break;
      case 'ROLE_CAMPOWNER':
        this.router.navigate(['/home']);
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
  }
}