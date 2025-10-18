import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ProfileService } from '../../shared/services/profile.service';
import { MentorProfile, MenteeProfile } from '../../shared/models/profile.model';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';

@Component({
  selector: 'app-my-mentors',
  standalone: true,
  imports: [CommonModule, Header, Footer],
  templateUrl: './my-mentors.html',
  styleUrls: ['./my-mentors.scss'],
})
export class MyMentors implements OnInit {
  currentMentee: MenteeProfile | null = null;
  mentors: MentorProfile[] = [];
  loading = true;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Load current user mentee profile
    this.profileService.getMenteeById(currentUser.uid).subscribe({
      next: (mentee) => {
        if (mentee) {
          this.currentMentee = mentee;
          this.loadMentors();
        } else {
          this.router.navigate(['/profile-completion']);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading mentee profile:', error);
        this.router.navigate(['/profile-completion']);
      }
    });
  }

  loadMentors(): void {
    if (!this.currentMentee || !this.currentMentee.mentors) {
      this.mentors = [];
      return;
    }

    // Load mentor profiles for each mentor ID in the mentee's mentors array
    const mentorPromises = this.currentMentee.mentors.map(mentorId =>
      this.profileService.getMentorById(mentorId.replace('_mentor', ''))
    );

    // Collect all mentor profiles
    this.mentors = [];
    mentorPromises.forEach(observable => {
      observable.subscribe({
        next: (mentor) => {
          if (mentor && !this.mentors.find(m => m.id === mentor.id)) {
            this.mentors.push(mentor);
          }
        },
        error: (error) => console.error('Error loading mentor:', error)
      });
    });
  }

  getMentorAvatar(mentor: MentorProfile): string {
    return mentor.photoUrl || 'https://api.dicebear.com/7.x/personas/svg?seed=' + mentor.name;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  goBackToDashboard(): void {
    this.router.navigate(['/mentee-dashboard']);
  }
}
