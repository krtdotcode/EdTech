import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.html',
})
export class Header {
  private authService = inject(AuthService);
  isMenuOpen = false;

  constructor(private router: Router) {}

  // Navigate to login page
  goToLogin() {
    this.router.navigate(['/login']);
  }

  // Navigate to register page
  goToRegister() {
    this.router.navigate(['/signup']);
  }

  // Navigate back to home
  goToHome() {
    this.router.navigate(['/home']);
  }

  // Sign out user
  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/home']);
    });
  }

  // Check if user is logged in (simplified for demo)
  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  // Get user email (simplified for demo)
  getUserEmail(): string {
    const user = this.authService.getCurrentUser();
    return user?.email || 'user@example.com';
  }

  // Get user role
  getUserRole(): string {
    // For now, simplified - in real app would fetch from profile
    try {
      const user = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        return userData.role || 'mentee';
      }
    } catch (e) {}
    return 'mentee';
  }

  // Navigate to appropriate dashboard based on role
  goToDashboard() {
    const role = this.getUserRole();
    if (role === 'mentor' || role === 'both') {
      this.router.navigate(['/mentor-dashboard']);
    } else {
      this.router.navigate(['/mentee-dashboard']);
    }
  }

  // Toggle mobile menu
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
