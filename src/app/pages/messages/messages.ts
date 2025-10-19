import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { MessagingService, Chat, Message } from '../../shared/services/messaging.service';
import { ProfileService } from '../../shared/services/profile.service';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';
import { MentorProfile, MenteeProfile } from '../../shared/models/profile.model';
import { Subscription } from 'rxjs';

interface Connection {
  id: string;
  name: string;
  role: string;
  photoUrl?: string;
  lastMessage?: Message;
  unreadCount: number;
  userId: string;
}

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, Footer],
  templateUrl: './messages.html',
})
export class Messages implements OnInit, OnDestroy {
  userRole: 'mentee' | 'mentor' | 'both' | null = null;
  currentUserId: string = '';
  chats: Chat[] = [];
  selectedChat: Chat | null = null;
  messages: Message[] = [];
  newMessage: string = '';
  loading = false;

  // New properties for feedback-style interface
  activeConnections: Connection[] = [];
  showChatModal = false;
  selectedConnection: Connection | null = null;
  chatMessages: Message[] = [];
  chatMessage: string = '';
  sendingMessage = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private messagingService: MessagingService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.currentUserId = currentUser.uid;

    // Get user role and load connections
    this.loadUserRoleAndConnections();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadUserRoleAndConnections(): void {
    this.authService.getUserRole(this.currentUserId).subscribe({
      next: (role) => {
        this.userRole = role as 'mentee' | 'mentor' | 'both' | null;
        this.loadActiveConnections();
      },
      error: (error) => {
        this.userRole = null;
      }
    });
  }

  loadActiveConnections(): void {
    this.loading = true;
    this.activeConnections = [];

    const userId = this.currentUserId;

    if (this.userRole === 'mentee' || this.userRole === 'both') {
      // Load mentors this user is connected to
      this.profileService.getMentorIdsForMentee(userId).subscribe({
        next: (mentorIds) => {
          mentorIds.forEach(mentorId => {
            this.profileService.getMentorById(mentorId).subscribe(mentor => {
              if (mentor) {
                this.activeConnections.push({
                  id: mentor.id,
                  name: mentor.name,
                  role: 'mentor',
                  photoUrl: mentor.photoUrl,
                  userId: mentorId,
                  unreadCount: 0
                });
              }
              this.loading = false;
            });
          });
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
        }
      });
    }

    if (this.userRole === 'mentor' || this.userRole === 'both') {
      // Load mentees this mentor is connected to
      this.profileService.getMenteeIdsForMentor(userId).subscribe({
        next: (menteeIds) => {
          menteeIds.forEach(menteeId => {
            this.profileService.getMenteeById(menteeId).subscribe(mentee => {
              if (mentee) {
                this.activeConnections.push({
                  id: mentee.id,
                  name: mentee.name,
                  role: 'mentee',
                  photoUrl: mentee.photoUrl,
                  userId: menteeId,
                  unreadCount: 0
                });
              }
              this.loading = false;
            });
          });
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
        }
      });
    }
  }

  startChat(connection: Connection): void {
    this.selectedConnection = connection;
    this.chatMessages = [];
    this.showChatModal = true;

    // Create or get existing chat
    this.messagingService.createChat(connection.userId).then(chatId => {
      // Mark any unread messages as read
      this.messagingService.markMessagesAsRead(chatId);

      // Subscribe to real-time chat messages
      const messagesSub = this.messagingService.getChatMessages(chatId).subscribe({
        next: (messages) => {
          this.chatMessages = messages;
          // Scroll to bottom after messages load/update
          setTimeout(() => this.scrollToModalBottom(), 100);
        },
        error: (error) => {}
      });

      // Store subscription for cleanup
      this.subscriptions.push(messagesSub);
    }).catch(error => {});
  }

  closeChatModal(): void {
    this.showChatModal = false;
    this.selectedConnection = null;
    this.chatMessages = [];
    this.chatMessage = '';
  }

  sendChatMessage(): void {
    if (!this.chatMessage.trim() || !this.selectedConnection) return;

    this.sendingMessage = true;

    // Create or get existing chat
    this.messagingService.createChat(this.selectedConnection.userId).then(chatId => {
      // Send the message
      this.messagingService.sendMessage(chatId, this.chatMessage, this.selectedConnection!.userId).then(() => {
        this.chatMessage = '';
        this.sendingMessage = false;
        // Messages will update automatically via real-time subscription
      }).catch(error => {
        this.sendingMessage = false;
      });
    }).catch(error => {
      this.sendingMessage = false;
    });
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }

  private scrollToModalBottom(): void {
    const container = document.querySelector('.messages-modal');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  goBackToDashboard(): void {
    if (this.userRole === 'mentor') {
      this.router.navigate(['/mentor-dashboard']);
    } else {
      this.router.navigate(['/mentee-dashboard']);
    }
  }
}
