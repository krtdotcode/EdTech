import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ProfileService } from '../../shared/services/profile.service';
import { MenteeProfile } from '../../shared/models/profile.model';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';

@Component({
  selector: 'app-mentee-dashboard',
  standalone: true,
  imports: [CommonModule, Header, Footer],
  templateUrl: './mentee-dashboard.html',
})
export class MenteeDashboard implements OnInit {
  currentMentee: MenteeProfile | null = null;
  loading = true;

  // Navigation cards for mentee features
  dashboardCards = [
    {
      title: 'Find Mentors',
      description: 'Discover and connect with experienced mentors in your field',
      icon: '🔍',
      route: '/matching',
      color: 'bg-blue-600',
    },
    {
      title: 'My Mentors',
      description: 'View paired mentors and ongoing mentorship relationships',
      icon: '👥',
      route: '/my-mentors',
      color: 'bg-green-600',
    },
    {
      title: 'Resources',
      description: 'Access learning materials and educational content',
      icon: '📚',
      route: '/resources',
      color: 'bg-purple-600',
    },
    {
      title: 'Messages',
      description: 'Communicate with mentors and track conversations',
      icon: '💬',
      route: '/messages',
      color: 'bg-indigo-600',
    },
    {
      title: 'Progress Tracking',
      description: 'Monitor your learning progress and achievements',
      icon: '📊',
      route: '/progress',
      color: 'bg-emerald-600',
    },
    {
      title: 'Schedule Meetings',
      description: 'Arrange and manage mentorship sessions',
      icon: '📅',
      route: '/scheduling',
      color: 'bg-cyan-600',
    },
    {
      title: 'My Profile',
      description: 'Update and manage your profile information',
      icon: '👤',
      route: '/profile',
      color: 'bg-teal-600',
    },
    {
      title: 'Feedback & Reviews',
      description: 'Leave feedback and review your mentorship experience',
      icon: '⭐',
      route: '/feedback',
      color: 'bg-orange-600',
    },
  ];

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load current mentee profile
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.profileService.getMenteeById(currentUser.uid).subscribe({
        next: (mentee) => {
          if (mentee) {
            this.currentMentee = mentee;
          } else {
            // No mentee profile, redirect to profile completion
            this.router.navigate(['/profile-completion']);
            return;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading mentee profile:', error);
          this.router.navigate(['/profile-completion']);
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  getUserAvatar(): string {
    return this.currentMentee?.photoUrl || 'https://api.dicebear.com/7.x/personas/svg?seed=' + (this.currentMentee?.name || 'default');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
