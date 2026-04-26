// src/app/features/auth/sign-up/sign-up.component.ts
import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { TextInputComponent } from '../../../components/shared/form-inputs/text-input/text-input.component';
import { PasswordInputComponent } from '../../../components/shared/form-inputs/password-input/password-input.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TextInputComponent, PasswordInputComponent],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <span class="auth-logo">Inkly</span>
        <h1>Create account</h1>
        <p class="subtitle">
          Already have an account?
          <a routerLink="/login">Sign in</a>
        </p>

        <form [formGroup]="signUpForm" (ngSubmit)="onSignUp()">
          <div *ngIf="errorMessage" class="auth-error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ errorMessage }}
          </div>

          <app-text-input
            [parentForm]="signUpForm"
            controlName="name"
            label="Full Name"
            placeholder="Jane Doe">
          </app-text-input>

          <app-text-input
            [parentForm]="signUpForm"
            controlName="email"
            label="Email"
            type="email"
            placeholder="you@example.com">
          </app-text-input>

          <app-text-input
            [parentForm]="signUpForm"
            controlName="phone"
            label="Phone Number"
            placeholder="8110002233">
          </app-text-input>

          <app-password-input
            [parentForm]="signUpForm"
            controlName="password"
            label="Password">
          </app-password-input>

          <app-password-input
            [parentForm]="signUpForm"
            controlName="confirmPassword"
            label="Confirm Password">
          </app-password-input>

          <div *ngIf="signUpForm.hasError('mismatch') && signUpForm.get('confirmPassword')?.dirty" class="auth-error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Passwords do not match.
          </div>

          <button type="submit" class="auth-btn" [disabled]="isLoading">
            <span *ngIf="isLoading" class="spinner"></span>
            {{ isLoading ? 'Creating account...' : 'Create account' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['../auth-pages.css']
})
export class SignUpComponent {
  signUpForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.signUpForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator });
  }

  onSignUp() {
    if (this.signUpForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.signUpForm.value).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Could not create account. Please try again.';
        this.cdr.markForCheck();
      }
    });
  }

  passwordsMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }
}