// This component handles the login form and user sign-in process
import { Component } from '@angular/core';
import { Header } from '../../../shared/components/header/header';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { ProfileService } from '../../../shared/services/profile.service';
import { NgxParticlesModule } from "@tsparticles/angular";
import { loadSlim } from "@tsparticles/slim";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, Header, NgxParticlesModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  // Form for collecting email and password
  loginForm: FormGroup;
  loading = false; // Shows loading spinner
  errorMessage = ''; // Shows error messages

  particlesInit = async (engine: any) => {
    await loadSlim(engine);
  };

  particlesOptions: any = {
    background: {
      color: {
        value: "transparent"
      }
    },
    fpsLimit: 60,
    particles: {
      color: {
        value: ["#ffffff", "#a855f7", "#8b5cf6", "#7c3aed"]
      },
      links: {
        color: "#ffffff",
        distance: 120,
        enable: true,
        opacity: 0.2,
        width: 1
      },
      move: {
        enable: true,
        outModes: {
          default: "bounce"
        },
        speed: 1
      },
      number: {
        density: {
          enable: true,
          area: 500
        },
        value: 120
      },
      opacity: {
        value: 0.4
      },
      shape: {
        type: "circle"
      },
      size: {
        value: { min: 2, max: 6 }
      }
    },
    detectRetina: true
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private profileService: ProfileService
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
          this.checkProfileAndRedirect(result.user.uid);
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

  // CHECK IF USER HAS COMPLETED PROFILE AND REDIRECT ACCORDINGLY
  private checkProfileAndRedirect(userId: string): void {

    // First check if user has completed their profile (simple one-time check)
    this.profileService.hasUserCompletedProfile(userId).subscribe({
      next: (hasCompleted: boolean) => {
        this.loading = false;

        if (hasCompleted) {
          // User has completed profile before, skip profile completion
          // Get role to determine which dashboard to show
          this.authService.getUserRole(userId).subscribe({
            next: (role) => {
              if (role === 'mentor') {
                this.router.navigate(['/mentor-dashboard']);
              } else {
                // Both mentees and 'both' role users go to mentee dashboard
                this.router.navigate(['/mentee-dashboard']);
              }
            },
            error: (error) => {
              console.error('Error getting user role after completion check:', error);
              // Fall back to mentee dashboard
              this.router.navigate(['/mentee-dashboard']);
            }
          });
        } else {
          // User has never completed a profile, go to profile completion
          this.router.navigate(['/profile-completion']);
        }
      },
      error: (error) => {
        console.error('Error checking profile completion status:', error);
        this.loading = false;
        // On error, fall back to profile completion
        this.router.navigate(['/profile-completion']);
      }
    });
  }

  // NAVIGATE TO SIGNUP PAGE
  goToSignup() {
    this.router.navigate(['/signup']);
  }
}
