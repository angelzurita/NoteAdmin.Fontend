import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';



@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly errorMessage = signal<string | null>(null);
  readonly isSubmitting = signal(false);

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.getRawValue();
    const success = this.authService.login({ email, password });

    if (success) {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage.set('Credenciales incorrectas. Usa admin@notes.com / admin123');
      this.isSubmitting.set(false);
    }
  }

  hasError(field: 'email' | 'password', error: string): boolean {
    const control = this.loginForm.get(field);
    return !!control?.hasError(error) && (control.dirty || control.touched);
  }
}
