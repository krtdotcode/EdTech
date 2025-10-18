import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ProfileService } from '../../shared/services/profile.service';
import { NotificationService, Notification } from '../../shared/services/notification.service';
import { MentorProfile, MentorshipRequest } from '../../shared/models/profile.model';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mentor-dashboard',
  standalone: true,
  imports: [CommonModule, Header, Footer],
  templateUrl: './mentor-dashboard.html',
})
export class MentorDashboard implements OnInit, OnDestroy {
  currentMentor: MentorProfile | null = null;
  mentorshipRequests: MentorshipRequest[] = [];
  notifications: Notification[] = [];
  unreadNotificationsCount = 0;
  loading = true;
  private subscriptions: Subscription[] = [];

  // Request operation status tracking by request ID and operation type
  requestOperationStatusMap: Map<string, {accept: 'idle' | 'loading' | 'completed', reject: 'idle' | 'loading' | 'completed'}> = new Map();

  // Navigation cards for mentor features
  dashboardCards = [
    {
      title: 'Mentorship Requests',
      description: 'Review and respond to new mentorship requests',
      icon: '📬',
      route: '/mentor-requests',
      color: 'bg-blue-600',
    },
    {
      title: 'My Mentees',
      description: 'Manage ongoing mentorship relationships',
      icon: '👥',
      route: '/my-mentees',
      color: 'bg-green-600',
    },
    {
      title: 'Resources',
      description: 'Share learning materials and resources',
      icon: '📚',
      route: '/resources',
      color: 'bg-purple-600',
    },
    {
      title: 'Messages',
      description: 'Communicate with mentees and track conversations',
      icon: '💬',
      route: '/messages',
      color: 'bg-indigo-600',
    },
    {
      title: 'Progress Tracking',
      description: 'Track mentee progress and milestones',
      icon: '📊',
      route: '/mentee-progress',
      color: 'bg-emerald-600',
    },
    {
      title: 'Schedule Sessions',
      description: 'Manage mentorship session scheduling',
      icon: '📅',
      route: '/scheduling',
      color: 'bg-cyan-600',
    },
    {
      title: 'My Profile',
      description: 'Update and manage your mentor profile',
      icon: '👤',
      route: '/profile',
      color: 'bg-teal-600',
    },
    {
      title: 'Feedback & Reviews',
      description: 'View mentor ratings and feedback',
      icon: '⭐',
      route: '/feedback',
      color: 'bg-orange-600',
    },
  ];

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load current mentor profile
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.profileService.getMentorById(currentUser.uid).subscribe({
        next: (mentor) => {
          if (mentor) {
            this.currentMentor = mentor;
            // Load pending requests for this mentor
            this.loadMentorshipRequests();
          } else {
            // No mentor profile, redirect to profile completion
            this.router.navigate(['/profile-completion']);
            return;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading mentor profile:', error);
          this.router.navigate(['/profile-completion']);
        }
      });
    } else {
      this.router.navigate(['/login']);
    }

    // Load notifications
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadNotifications(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    console.log('Loading notifications for user:', currentUser.uid);
    const notificationsSub = this.notificationService.getUserNotifications().subscribe({
      next: (notifications) => {
        console.log('Received notifications:', notifications);
        this.notifications = notifications;
        this.unreadNotificationsCount = notifications.filter(n => !n.read).length;
        console.log('Unread notifications count:', this.unreadNotificationsCount);
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
      }
    });

    this.subscriptions.push(notificationsSub);
  }

  loadMentorshipRequests(): void {
    if (this.currentMentor) {
      // TODO: Set up mentor ID properly when mentorship requests are created
      // For now, get all requests and filter to this mentor
      this.profileService.getMentorshipRequests().subscribe({
        next: (requests) => {
          // Filter requests for this mentor and only show pending requests
          this.mentorshipRequests = requests.filter(req =>
            req.mentorId === this.currentMentor?.id && req.status === 'pending'
          );
        },
        error: (error) => {
          console.error('Error loading mentorship requests:', error);
        }
      });
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  getUserAvatar(): string {
    return this.currentMentor?.photoUrl || 'https://api.dicebear.com/7.x/personas/svg?seed=' + (this.currentMentor?.name || 'default');
  }

  getMenteeInitials(menteeId: string): string {
    // Extract initials from mentee ID (first 2 characters as fallback)
    if (menteeId && menteeId.length >= 2) {
      return menteeId.substring(0, 2).toUpperCase();
    }
    return menteeId ? menteeId.charAt(0).toUpperCase() : '?';
  }

  acceptRequest(requestId: string): void {
    // Set loading state
    this.setRequestOperationStatus(requestId, 'accept', 'loading');

    this.profileService.acceptMentorshipRequest(requestId).subscribe({
      next: () => {
        console.log('Mentorship request accepted successfully');
        this.setRequestOperationStatus(requestId, 'accept', 'completed');

        // Immediately remove the request from the UI
        this.removeRequestFromList(requestId);

        // Delete the notification for this request
        this.removeMentorshipRequestNotification(requestId);

        // Reload in background to ensure sync (optional)
        setTimeout(() => this.loadMentorshipRequests(), 100);
        this.loadMentorProfile(); // Refresh mentor data to show updated counts
      },
      error: (error) => {
        console.error('Error accepting mentorship request:', error);
        this.setRequestOperationStatus(requestId, 'accept', 'idle'); // Reset on error
      }
    });
  }

  rejectRequest(requestId: string): void {
    // Set loading state
    this.setRequestOperationStatus(requestId, 'reject', 'loading');

    this.profileService.rejectMentorshipRequest(requestId).subscribe({
      next: () => {
        console.log('Mentorship request rejected');
        this.setRequestOperationStatus(requestId, 'reject', 'completed');

        // Immediately remove the request from the UI
        this.removeRequestFromList(requestId);

        // Reload in background to ensure sync (optional)
        setTimeout(() => this.loadMentorshipRequests(), 100);
      },
      error: (error) => {
        console.error('Error rejecting mentorship request:', error);
        this.setRequestOperationStatus(requestId, 'reject', 'idle'); // Reset on error
      }
    });
  }

  // Helper methods for request operation states
  private setRequestOperationStatus(requestId: string, operation: 'accept' | 'reject', status: 'idle' | 'loading' | 'completed'): void {
    const currentStatus = this.requestOperationStatusMap.get(requestId) || {accept: 'idle' as const, reject: 'idle' as const};
    currentStatus[operation] = status;
    this.requestOperationStatusMap.set(requestId, currentStatus);
  }

  isRequestOperationLoading(requestId: string, operation: 'accept' | 'reject'): boolean {
    const status = this.requestOperationStatusMap.get(requestId);
    return status ? status[operation] === 'loading' : false;
  }

  getAcceptButtonText(requestId: string): string {
    const status = this.requestOperationStatusMap.get(requestId);
    return status?.accept === 'completed' ? 'Accepted' : 'Accept';
  }

  getRejectButtonText(requestId: string): string {
    const status = this.requestOperationStatusMap.get(requestId);
    return status?.reject === 'completed' ? 'Rejected' : 'Reject';
  }

  getAcceptButtonClasses(requestId: string): string {
    const status = this.requestOperationStatusMap.get(requestId);
    const baseClasses = 'px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed';

    switch (status?.accept) {
      case 'loading':
        return `${baseClasses} bg-blue-600 text-white`;
      case 'completed':
        return `${baseClasses} bg-green-600 hover:bg-green-700 text-white`;
      default:
        return `${baseClasses} bg-green-600 hover:bg-green-700 text-white`;
    }
  }

  getRejectButtonClasses(requestId: string): string {
    const status = this.requestOperationStatusMap.get(requestId);
    const baseClasses = 'px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed';

    switch (status?.reject) {
      case 'loading':
        return `${baseClasses} bg-blue-600 text-white`;
      case 'completed':
        return `${baseClasses} bg-red-500 hover:bg-red-600 text-white`;
      default:
        return `${baseClasses} bg-red-600 hover:bg-red-700 text-white`;
    }
  }

  // Immediately remove a request from the UI list
  private removeRequestFromList(requestId: string): void {
    this.mentorshipRequests = this.mentorshipRequests.filter(req => req.id !== requestId);
  }

  // Remove the notification for a specific mentorship request
  private removeMentorshipRequestNotification(requestId: string): void {
    // Find the notification with this requestId in its data field
    const relatedNotification = this.notifications.find(notification =>
      notification.type === 'mentorship_request' &&
      notification.data?.requestId === requestId
    );

    if (relatedNotification) {
      console.log('Removing notification for request:', requestId);
      this.notificationService.deleteNotification(relatedNotification.id).then(() => {
        console.log('Notification removed successfully');
        // The notification will be automatically removed from the UI due to real-time updates
      }).catch(error => {
        console.error('Failed to remove notification:', error);
      });
    } else {
      console.log('No matching notification found for request:', requestId);
    }
  }

  // Reload mentor profile to update counts
  private loadMentorProfile(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.profileService.getMentorById(currentUser.uid).subscribe({
        next: (mentor) => {
          if (mentor) {
            this.currentMentor = mentor;
          }
        },
        error: (error) => {
          console.error('Error reloading mentor profile:', error);
        }
      });
    }
  }



  markAllNotificationsAsRead(): void {
    this.notificationService.markAllNotificationsAsRead().then(() => {
      this.notifications.forEach(n => n.read = true);
      this.unreadNotificationsCount = 0;
    }).catch(error => {
      console.error('Error marking all notifications as read:', error);
    });
  }

  markNotificationAsRead(notificationId: string): void {
    this.notificationService.markNotificationAsRead(notificationId).then(() => {
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        this.unreadNotificationsCount--;
      }
    }).catch(error => {
      console.error('Error marking notification as read:', error);
    });
  }
}
