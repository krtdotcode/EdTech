import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ProfileService } from '../../shared/services/profile.service';
import { NotificationService, Notification } from '../../shared/services/notification.service';
import { MentorProfile, MentorshipRequest } from '../../shared/models/profile.model';
import { Header } from '../../shared/components/header/header';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mentor-dashboard',
  standalone: true,
  imports: [CommonModule, Header],
  templateUrl: './mentor-dashboard.html',
})
export class MentorDashboard implements OnInit, OnDestroy {
  currentMentor: MentorProfile | null = null;
  mentorshipRequests: MentorshipRequest[] = [];
  notifications: Notification[] = [];
  unreadNotificationsCount = 0;
  loading = true;
  private subscriptions: Subscription[] = [];

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
          // Filter requests for this mentor (will need to update service to store mentor document ID properly)
          this.mentorshipRequests = requests.filter(req => req.mentorId === this.currentMentor?.id);
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

  acceptRequest(requestId: string): void {
    this.profileService.updateMentorshipRequestStatus(requestId, 'accepted').subscribe({
      next: () => {
        this.loadMentorshipRequests(); // Refresh the list
      },
      error: (error) => {
        console.error('Error accepting request:', error);
      }
    });
  }

  rejectRequest(requestId: string): void {
    this.profileService.updateMentorshipRequestStatus(requestId, 'rejected').subscribe({
      next: () => {
        this.loadMentorshipRequests(); // Refresh the list
      },
      error: (error) => {
        console.error('Error rejecting request:', error);
      }
    });
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
