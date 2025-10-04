// This component handles the login form and user sign-in process
import { Component } from '@angular/core';
import { Header } from '../../../shared/components/header/header';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, Header],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  // Form for collecting email and password
  loginForm: FormGroup;
  loading = false; // Shows loading spinner
  errorMessage = ''; // Shows error messages

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private authService: AuthService
  ) {
    // Create form with validation rules
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Required + must be valid email
      password: ['', [Validators.required, Validators.minLength(6)]] // Required + min 6 chars
    });
  }

  // HANDLE FORM SUBMISSION
  onSignIn() {
    // Only proceed if form is valid
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      
      // Get values from form
      const { email, password } = this.loginForm.value;
      
      // Call auth service to sign in
      this.authService.login(email, password).subscribe({
        next: (result) => {
          // SUCCESS: User signed in
          console.log('Login successful:', result);
          this.loading = false;
          // Go to profile page
          this.router.navigate(['/profile']);
        },
        error: (error) => {
          // ERROR: Something went wrong
          console.error('Login error:', error);
          this.loading = false;
          this.errorMessage = this.getErrorMessage(error.code);
        }
      });
    }
  }

  // CONVERT FIREBASE ERROR CODES TO USER-FRIENDLY MESSAGES
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No user found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Please try again later.';
      default:
        return 'An error occurred during login. Please try again.';
    }
  }

  // NAVIGATE TO REGISTER PAGE
  goToRegister() {
    this.router.navigate(['/register']);
  }
}
