// src/app/features/auth/sign-up/sign-up.component.ts
import { Component } from '@angular/core';
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
        <h1>Sign Up</h1>
        <p class="subtitle">
          Already have an account? 
          <a routerLink="/login">Log in</a> 
        </p>

        <form [formGroup]="signUpForm" (ngSubmit)="onSignUp()">
          <app-text-input 
            [parentForm]="signUpForm" 
            controlName="name" 
            label="Name" 
            placeholder="Full Name...">
          </app-text-input>

          <app-text-input 
            [parentForm]="signUpForm" 
            controlName="email" 
            label="Mail" 
            type="email" 
            placeholder="Email@email.com">
          </app-text-input>

          <app-text-input 
            [parentForm]="signUpForm" 
            controlName="phone" 
            label="Phone Number" 
            placeholder="e.g. 8110002233">
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

          <button type="submit" class="auth-btn">Sign Up</button>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['../auth-pages.css']
})
export class SignUpComponent {
  signUpForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signUpForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]*$')]], // Validación para solo números
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator });
  }

  onSignUp() {
    if (this.signUpForm.valid) {
      this.authService.register(this.signUpForm.value).subscribe({
        next: (response) => {
          console.log('Registro exitoso:', response);
          // Redirigimos al login después del registro exitoso
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Error en el registro:', err);
          // Mostramos el error que viene del backend (.NET InnerException)
          alert(err.error?.message || 'Error al crear la cuenta');
        }
      });
    }
  }

  passwordsMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
       ? null : {'mismatch': true};
  }
}