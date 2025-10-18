import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.html',
})
export class Header {
  constructor(private router: Router) {}

  // Navigate to login page
  goToLogin() {
    this.router.navigate(['/login']);
  }

  // Navigate to register page
  goToRegister() {
    this.router.navigate(['/register']);
  }

  // Navigate back to home
  goToHome() {
    this.router.navigate(['/']);
  }

  // Sign out user
  logout() {
    // For now, navigate to login page
    // In a full implementation, this would call auth service
    this.router.navigate(['/login']);
  }

  // Check if user is logged in (simplified for demo)
  isLoggedIn(): boolean {
    // Check for authentication token or session
    return localStorage.getItem('user') !== null ||
           sessionStorage.getItem('user') !== null;
  }

  // Get user email (simplified for demo)
  getUserEmail(): string {
    try {
      const user = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        return userData.email || 'user@example.com';
      }
    } catch (e) {}
    return 'user@example.com';
  }
}
