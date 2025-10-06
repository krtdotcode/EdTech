// This component handles new user registration
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { Header } from '../../../shared/components/header/header';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, Header],
  templateUrl: './signup.html',
  styleUrl: './signup.scss'
})
export class Signup {
  // Form for collecting user registration info
  signupForm: FormGroup;
  loading = false; // Shows loading spinner
  errorMessage = ''; // Shows error messages
  successMessage = ''; // Shows success messages

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    // Create form with validation rules
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Required + valid email
      password: ['', [Validators.required, Validators.minLength(6)]], // Required + min 6 chars
      confirmPassword: ['', [Validators.required]], // Required password confirmation
      role: ['', [Validators.required]] // Required role selection
    }, { validators: this.passwordMatchValidator }); // Custom validation for matching passwords
  }


  // CUSTOM VALIDATION: Check if passwords match
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    // Return error if passwords don't match
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null; // No error
  }

  // HANDLE FORM SUBMISSION
  onSignup() {
    // Only proceed if form is valid
    if (this.signupForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      // Get values from form
      const { email, password, role } = this.signupForm.value;

      // Call auth service to create account with role
      this.authService.register(email, password, role).subscribe({
        next: (result) => {
          // SUCCESS: Account created
          console.log('Registration successful:', result);
          this.loading = false;
          this.successMessage = 'Account created successfully! Redirecting to profile completion...';

          // Auto-login happens automatically, redirect to profile completion
          setTimeout(() => {
            this.router.navigate(['/profile-completion']);
          }, 2000);
        },
        error: (error) => {
          // ERROR: Something went wrong
          console.error('Registration error:', error);
          this.loading = false;
          this.errorMessage = this.getErrorMessage(error.code);
        }
      });
    }
  }

  // CONVERT FIREBASE ERROR CODES TO USER-FRIENDLY MESSAGES
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'An account with this email address already exists.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled.';
      default:
        return 'An error occurred during registration. Please try again.';
    }
  }

  // NAVIGATE TO LOGIN PAGE
  goToLogin() {
    this.router.navigate(['/login']);
  }
}

