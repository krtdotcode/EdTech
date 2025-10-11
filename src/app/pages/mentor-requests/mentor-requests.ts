import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfileService } from '../../shared/services/profile.service';
import { MentorshipRequest, MentorProfile } from '../../shared/models/profile.model';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-mentor-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mentor-requests.html',
})
export class MentorRequests implements OnInit {
  mentorshipRequests: MentorshipRequest[] = [];
  currentMentorId: string = '';

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Load current user's mentor profile to get mentor ID
    this.profileService.getMentorById(currentUser.uid).subscribe({
      next: (mentor) => {
        if (mentor) {
          this.currentMentorId = mentor.id;
          this.loadMentorshipRequests();
        } else {
          // No mentor profile found, redirect to profile completion
          this.router.navigate(['/profile-completion']);
        }
      },
      error: (error) => {
        console.error('Error loading mentor profile:', error);
        this.router.navigate(['/profile-completion']);
      }
    });
  }

  loadMentorshipRequests(): void {
    this.profileService.getMentorshipRequests().subscribe(requests => {
      this.mentorshipRequests = requests.filter(req => req.mentorId === this.currentMentorId);
    });
  }

  acceptRequest(requestId: string): void {
    this.profileService.updateMentorshipRequestStatus(requestId, 'accepted').subscribe(
      response => {
        console.log('Request accepted:', response);
        alert('Mentorship request accepted!');
        this.loadMentorshipRequests(); // Refresh the list
      },
      error => {
        console.error('Error accepting request:', error);
        alert('Failed to accept mentorship request.');
      }
    );
  }

  rejectRequest(requestId: string): void {
    this.profileService.updateMentorshipRequestStatus(requestId, 'rejected').subscribe(
      response => {
        console.log('Request rejected:', response);
        alert('Mentorship request rejected!');
        this.loadMentorshipRequests(); // Refresh the list
      },
      error => {
        console.error('Error rejecting request:', error);
        alert('Failed to reject mentorship request.');
      }
    );
  }
}
