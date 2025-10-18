import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ProfileService } from '../../shared/services/profile.service';
import { MentorProfile, MenteeProfile } from '../../shared/models/profile.model';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';

@Component({
  selector: 'app-my-mentees',
  standalone: true,
  imports: [CommonModule, Header, Footer],
  templateUrl: './my-mentees.html',
  styleUrls: ['./my-mentees.scss'],
})
export class MyMentees implements OnInit {
  currentMentor: MentorProfile | null = null;
  mentees: MenteeProfile[] = [];
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

    // Load current user mentor profile
    this.profileService.getMentorById(currentUser.uid).subscribe({
      next: (mentor) => {
        if (mentor) {
          this.currentMentor = mentor;
          this.loadMentees();
        } else {
          this.router.navigate(['/profile-completion']);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading mentor profile:', error);
        this.router.navigate(['/profile-completion']);
      }
    });
  }

  loadMentees(): void {
    if (!this.currentMentor || !this.currentMentor.mentees) {
      this.mentees = [];
      return;
    }

    // Load mentee profiles for each mentee ID in the mentor's mentees array
    const menteePromises = this.currentMentor.mentees.map(menteeId =>
      this.profileService.getMenteeById(menteeId.replace('_mentee', ''))
    );

    // Collect all mentee profiles
    this.mentees = [];
    menteePromises.forEach(observable => {
      observable.subscribe({
        next: (mentee) => {
          if (mentee && !this.mentees.find(m => m.id === mentee.id)) {
            this.mentees.push(mentee);
          }
        },
        error: (error) => console.error('Error loading mentee:', error)
      });
    });
  }

  getMenteeAvatar(mentee: MenteeProfile): string {
    return mentee.photoUrl || 'https://api.dicebear.com/7.x/personas/svg?seed=' + mentee.name;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  goBackToDashboard(): void {
    this.router.navigate(['/mentor-dashboard']);
  }

  viewMenteeProfile(menteeId: string): void {
    // Navigate to a detailed mentee profile view or progress page
    // For now, navigate to messages or progress
    this.router.navigate(['/messages'], { queryParams: { userId: menteeId } });
  }
}
