import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from, map, switchMap, combineLatest } from 'rxjs';
import { Firestore, doc, collection, query, orderBy, addDoc, updateDoc, onSnapshot, where, Timestamp, limit as firestoreLimit, getDoc, setDoc, getDocs } from '@angular/fire/firestore';
import { AuthService } from '../../core/auth/auth.service';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
  messageType: 'text' | 'system';
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  private chatsSubject = new BehaviorSubject<Chat[]>([]);

  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {}

  // Create or get existing chat between two users
  async createChat(otherUserId: string): Promise<string> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) throw new Error('User not authenticated');

    const currentUserId = currentUser.uid;
    const chatId = this.generateChatId(currentUserId, otherUserId);

    // Check if chat already exists, if not create it
    const chatRef = doc(this.firestore, 'chats', chatId);
    const chatDoc = await (from(getDoc(chatRef)).toPromise());

    if (!chatDoc?.exists()) {
      // Create new chat document
      await setDoc(chatRef, {
        participants: [currentUserId, otherUserId],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }

    return chatId;
  }

  // Send a message
  async sendMessage(chatId: string, content: string, receiverId: string): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) throw new Error('User not authenticated');

    const messageData = {
      senderId: currentUser.uid,
      receiverId: receiverId,
      content: content.trim(),
      timestamp: Timestamp.now(),
      read: false,
      messageType: 'text' as const
    };

    // Add message to messages collection
    const messagesRef = collection(this.firestore, 'messages');
    await addDoc(messagesRef, messageData);

    // Update chat's last message and timestamp
    const chatRef = doc(this.firestore, 'chats', chatId);
    await updateDoc(chatRef, {
      lastMessage: messageData,
      updatedAt: Timestamp.now()
    });
  }

  // Get real-time messages for a chat
  getChatMessages(chatId: string): Observable<Message[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return this.messagesSubject.asObservable();

    const messagesRef = collection(this.firestore, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    return new Observable<Message[]>(observer => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages: Message[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Filter messages that belong to this chat
          if ((data['senderId'] === currentUser.uid && data['receiverId'] === this.getOtherParticipant(chatId, currentUser.uid)) ||
              (data['receiverId'] === currentUser.uid && data['senderId'] === this.getOtherParticipant(chatId, currentUser.uid))) {
            messages.push({
              id: doc.id,
              senderId: data['senderId'],
              receiverId: data['receiverId'],
              content: data['content'],
              timestamp: data['timestamp'].toDate(),
              read: data['read'],
              messageType: data['messageType'] || 'text'
            });
          }
        });
        observer.next(messages);
      });

      // Cleanup subscription
      return () => unsubscribe();
    });
  }

  // Get user chats (real-time)
  getUserChats(): Observable<Chat[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return this.chatsSubject.asObservable();

    const chatsRef = collection(this.firestore, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', currentUser.uid), orderBy('updatedAt', 'desc'));

    return new Observable<Chat[]>(observer => {
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const chats: Chat[] = [];
        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          const chat: Chat = {
            id: doc.id,
            participants: data['participants'],
            updatedAt: data['updatedAt']?.toDate() || new Date(),
            unreadCount: 0
          };

          // Get last message
          if (data['lastMessage']) {
            chat.lastMessage = {
              id: '',
              senderId: data['lastMessage']['senderId'],
              receiverId: data['lastMessage']['receiverId'],
              content: data['lastMessage']['content'],
              timestamp: data['lastMessage']['timestamp'].toDate(),
              read: data['lastMessage']['read'],
              messageType: data['lastMessage']['messageType'] || 'text'
            };

            // Calculate unread count for current user
            chat.unreadCount = await this.getUnreadCountForChat(doc.id, currentUser.uid);
          }

          chats.push(chat);
        }
        observer.next(chats);
      });

      return () => unsubscribe();
    });
  }

  // Mark messages as read
  async markMessagesAsRead(chatId: string): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const otherUserId = this.getOtherParticipant(chatId, currentUser.uid);

    // Query messages that are unread and sent to current user
    const messagesRef = collection(this.firestore, 'messages');
    const q = query(messagesRef,
      where('senderId', '==', otherUserId),
      where('receiverId', '==', currentUser.uid),
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

  // Get unread count for a specific chat
  private async getUnreadCountForChat(chatId: string, userId: string): Promise<number> {
    const otherUserId = this.getOtherParticipant(chatId, userId);

    const messagesRef = collection(this.firestore, 'messages');
    const q = query(messagesRef,
      where('senderId', '==', otherUserId),
      where('receiverId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await from(getDocs(q)).toPromise();
    return querySnapshot ? querySnapshot.size : 0;
  }

  // Generate consistent chat ID from two user IDs
  private generateChatId(userId1: string, userId2: string): string {
    return [userId1, userId2].sort().join('_');
  }

  // Get the other participant in a chat
  private getOtherParticipant(chatId: string, currentUserId: string): string {
    const ids = chatId.split('_');
    return ids.find(id => id !== currentUserId) || '';
  }

  // Get total unread count for user
  getTotalUnreadCount(): Observable<number> {
    return this.getUserChats().pipe(
      map(chats => chats.reduce((total, chat) => total + chat.unreadCount, 0))
    );
  }
}
