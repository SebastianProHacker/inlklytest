// login.component.ts
import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { TextInputComponent } from '../../../components/shared/form-inputs/text-input/text-input.component';
import { PasswordInputComponent } from '../../../components/shared/form-inputs/password-input/password-input.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TextInputComponent, PasswordInputComponent],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <span class="auth-logo">Inkly</span>
        <h1>Welcome back</h1>
        <p class="subtitle">
          Don't have an account?
          <a routerLink="/sign-up">Sign up</a>
        </p>

        <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
          <div *ngIf="infoMessage" class="auth-info">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ infoMessage }}
          </div>

          <div *ngIf="errorMessage" class="auth-error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ errorMessage }}
          </div>

          <app-text-input
            [parentForm]="loginForm"
            controlName="email"
            label="Email"
            type="email"
            placeholder="you@example.com">
          </app-text-input>

          <app-password-input
            [parentForm]="loginForm"
            controlName="password"
            label="Password">
          </app-password-input>

          <button type="submit" class="auth-btn" [disabled]="isLoading">
            <span *ngIf="isLoading" class="spinner"></span>
            {{ isLoading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['../auth-pages.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  infoMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    if (authService.redirectMessage) {
      this.infoMessage = authService.redirectMessage;
      authService.redirectMessage = null;
    }
  }

  onLogin() {
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response: any) => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid credentials. Please try again.';
        this.cdr.markForCheck();
      }
    });
  }
}