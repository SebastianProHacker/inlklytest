// login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router'; // Importar RouterModule y Router
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
        <h1>Login</h1>
        <p class="subtitle">
          Don't have an account? 
          <a routerLink="/sign-up">Sign Up</a> </p>

        <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
          <app-text-input 
            [parentForm]="loginForm" 
            controlName="email" 
            label="Mail" 
            type="email" 
            placeholder="Email@email.com">
          </app-text-input>

          <app-password-input 
            [parentForm]="loginForm" 
            controlName="password" 
            label="Password">
          </app-password-input>

          <button type="submit" class="auth-btn">Login</button>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['../auth-pages.css'] // Compartiremos el CSS
})
export class LoginComponent {
  loginForm: FormGroup;

 constructor(
  private fb: FormBuilder, 
  private router: Router,
  private authService: AuthService // <--- ESTO FALTABA
) {
  this.loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
}

onLogin() {
  if (this.loginForm.valid) {
    // Especificamos que la respuesta es de tipo 'any' para evitar error de tipos
    this.authService.login(this.loginForm.value).subscribe({
      next: (response: any) => { // <--- Añadimos ': any'
        console.log('Token recibido:', response.token);
        this.router.navigate(['/agenda']);
      },
      error: (err) => {
        // Usamos el encadenamiento opcional ?. por si el backend no manda mensaje
        alert('Error: ' + (err.error?.message || 'Unauthorized'));
      }
    });
  }
}
}