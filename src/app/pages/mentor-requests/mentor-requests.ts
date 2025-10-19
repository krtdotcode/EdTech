import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfileService } from '../../shared/services/profile.service';
import { NotificationService } from '../../shared/services/notification.service';
import { MessagingService } from '../../shared/services/messaging.service';
import { MentorshipRequest, MentorProfile } from '../../shared/models/profile.model';
import { AuthService } from '../../core/auth/auth.service';

declare var window: any;

@Component({
  selector: 'app-mentor-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mentor-requests.html',
})
export class MentorRequests implements OnInit {
  mentorshipRequests: MentorshipRequest[] = [];
  currentMentorId: string = '';

  // Immediately remove a request from the UI list
  private removeRequestFromList(requestId: string): void {
    this.mentorshipRequests = this.mentorshipRequests.filter(req => req.id !== requestId);
  }

  constructor(
    private profileService: ProfileService,
    private notificationService: NotificationService,
    private messagingService: MessagingService,
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
      this.mentorshipRequests = requests.filter(req =>
        req.mentorId === this.currentMentorId && req.status === 'pending'
      );
    });
  }

  async acceptRequest(requestId: string): Promise<void> {
    try {
      // Get request details to find mentee ID
      const requests = await this.profileService.getMentorshipRequests().toPromise();
      const request = requests?.find(r => r.id === requestId);

      if (!request) {
        alert('Request not found.');
        return;
      }

      // Extract mentee user ID
      const menteeUserId = request.menteeId.replace('_mentee', '');

      // Get mentor name for notifications
      const currentUser = this.authService.getCurrentUser();
      let mentorName = 'Your mentor';
      if (currentUser) {
        const mentorProfile = await this.profileService.getMentorById(currentUser.uid).toPromise();
        if (mentorProfile) {
          mentorName = mentorProfile.name;
        }
      }

      // Update request status
      this.profileService.updateMentorshipRequestStatus(requestId, 'accepted').subscribe({
        next: async () => {


          // Immediately remove the request from the UI
          this.removeRequestFromList(requestId);

          try {
            // Create approval notification for mentee
            await this.notificationService.createMentorshipApprovalNotification(
              menteeUserId,
              mentorName
            );

            // Show push notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('✅ Request Accepted!', {
                body: 'You can now connect and start learning together!',
                icon: 'edtech-logo.png'
              });
            }

            alert('Mentorship request accepted! The mentee has been notified.');
            // Reload in background to ensure sync (optional)
            setTimeout(() => this.loadMentorshipRequests(), 100);
          } catch (error) {
            console.error('Error creating notification:', error);
            alert('Request accepted, but there was an issue with the notification.');
          }
        },
        error: (error: any) => {
          console.error('Error accepting request:', error);
          alert('Failed to accept mentorship request.');
        }
      });

    } catch (error) {
      console.error('Error in acceptRequest:', error);
      alert('Failed to accept mentorship request.');
    }
  }

  async rejectRequest(requestId: string): Promise<void> {
    try {
      // Get request details to find mentee ID
      const requests = await this.profileService.getMentorshipRequests().toPromise();
      const request = requests?.find(r => r.id === requestId);

      if (!request) {
        alert('Request not found.');
        return;
      }

      // Extract mentee user ID
      const menteeUserId = request.menteeId.replace('_mentee', '');

      // Get mentor name for notifications
      const currentUser = this.authService.getCurrentUser();
      let mentorName = 'Your mentor';
      if (currentUser) {
        const mentorProfile = await this.profileService.getMentorById(currentUser.uid).toPromise();
        if (mentorProfile) {
          mentorName = mentorProfile.name;
        }
      }

      // Update request status
      this.profileService.updateMentorshipRequestStatus(requestId, 'rejected').subscribe({
        next: async () => {


          // Immediately remove the request from the UI
          this.removeRequestFromList(requestId);

          try {
            // Create rejection notification for mentee
            await this.notificationService.createMentorshipRejectionNotification(
              menteeUserId,
              mentorName
            );

            // Show push notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('❌ Request Declined', {
                body: 'The mentee has been notified of your decision.',
                icon: 'edtech-logo.png'
              });
            }

            alert('Mentorship request declined. The mentee has been notified.');
            // Reload in background to ensure sync (optional)
            setTimeout(() => this.loadMentorshipRequests(), 100);
          } catch (error) {
            console.error('Error creating notification:', error);
            alert('Request declined, but there was an issue with the notification.');
          }
        },
        error: (error: any) => {
          console.error('Error rejecting request:', error);
          alert('Failed to reject mentorship request.');
        }
      });

    } catch (error) {
      console.error('Error in rejectRequest:', error);
      alert('Failed to reject mentorship request.');
    }
  }

  goBackToDashboard(): void {
    this.router.navigate(['/mentor-dashboard']);
  }
}
