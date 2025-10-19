import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './messages.html',
})
export class Messages implements OnInit {
  userRole: 'mentee' | 'mentor' | 'both' | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Determine user role for proper navigation
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.authService.getUserRole(currentUser.uid).subscribe({
        next: (role) => {
          this.userRole = role as 'mentee' | 'mentor' | 'both' | null;
        },
        error: (error) => {
          console.error('Error getting user role:', error);
          this.userRole = null;
        }
      });
    }
  }

  goBackToDashboard(): void {
    // Navigate based on user role
    if (this.userRole === 'mentor') {
      this.router.navigate(['/mentor-dashboard']);
    } else {
      this.router.navigate(['/mentee-dashboard']);
    }
  }
}
