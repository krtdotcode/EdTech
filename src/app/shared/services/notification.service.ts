import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { Firestore, collection, addDoc, query, orderBy, limit, where, Timestamp, onSnapshot, doc, updateDoc, deleteDoc, getDocs } from '@angular/fire/firestore';
import { map } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'mentorship_request' | 'mentorship_approved' | 'mentorship_rejected' | 'system';
  read: boolean;
  createdAt: Date;
  data?: any; // Additional data (e.g., requestId)
}

export type NotificationType = 'mentorship_request' | 'mentorship_approved' | 'mentorship_rejected' | 'system';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);

  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {}

  // Create a notification
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<void> {
    const notificationData = {
      ...notification,
      createdAt: Timestamp.now()
    };

    const notificationsRef = collection(this.firestore, 'notifications');
    await addDoc(notificationsRef, notificationData);
  }

  // Create mentorship request notification
  async createMentorshipRequestNotification(userId: string, requesterName: string, requestId: string): Promise<void> {
    await this.createNotification({
      userId,
      title: '📬 New Mentorship Request',
      message: `${requesterName} has sent you a mentorship request. Review it in your mentor dashboard.`,
      type: 'mentorship_request',
      read: false,
      data: { requestId }
    });
  }

  // Create mentorship approval notification
  async createMentorshipApprovalNotification(userId: string, mentorName: string): Promise<void> {
    await this.createNotification({
      userId,
      title: '✅ Request Approved!',
      message: `Congratulations! ${mentorName} has accepted your mentorship request. You can now connect and start learning together.`,
      type: 'mentorship_approved',
      read: false
    });
  }

  // Create mentorship rejection notification
  async createMentorshipRejectionNotification(userId: string, mentorName: string): Promise<void> {
    await this.createNotification({
      userId,
      title: '❌ Request Declined',
      message: `${mentorName} has declined your mentorship request at this time. Don't worry - keep exploring other mentors who match your goals!`,
      type: 'mentorship_rejected',
      read: false
    });
  }

  // Get user notifications (with real-time updates)
  getUserNotifications(): Observable<Notification[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return this.notificationsSubject.asObservable();

    const notificationsRef = collection(this.firestore, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return new Observable<Notification[]>(observer => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const notifications: Notification[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          notifications.push({
            id: doc.id,
            userId: data['userId'],
            title: data['title'],
            message: data['message'],
            type: data['type'],
            read: data['read'],
            createdAt: data['createdAt'].toDate(),
            data: data['data']
          });
        });
        observer.next(notifications);
      });

      return () => unsubscribe();
    });
  }

  // Mark notification as read (could expand this for bulk operations)
  async markNotificationAsRead(notificationId: string): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const notificationRef = doc(this.firestore, 'notifications', notificationId);
    await updateDoc(notificationRef, { read: true });
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const notificationsRef = collection(this.firestore, 'notifications');
    const q = query(notificationsRef,
      where('userId', '==', currentUser.uid),
      where('read', '==', false)
    );

    const querySnapshot = await from(getDocs(q)).toPromise();
    if (querySnapshot) {
      const updatePromises = querySnapshot.docs.map(doc =>
        updateDoc(doc.ref, { read: true })
      );
      await Promise.all(updatePromises);
    }
  }

  // Get unread count
  getUnreadCount(): Observable<number> {
    return this.getUserNotifications().pipe(
      map(notifications => notifications.filter(n => !n.read).length)
    );
  }

  // Delete notification (optional feature)
  async deleteNotification(notificationId: string): Promise<void> {
    const notificationRef = doc(this.firestore, 'notifications', notificationId);
    await deleteDoc(notificationRef);
  }
}
