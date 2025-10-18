// This service handles all authentication operations with Firebase
// It's like a bridge between your app and Firebase's authentication system
import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  deleteUser,
  user,
  User,
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Observable, from, map, tap, concatMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // This observable tracks the current user state
  // It automatically updates when user logs in/out
  user$: Observable<User | null>;

  constructor(private auth: Auth, private firestore: Firestore) {
    this.user$ = user(this.auth);
  }

  // CREATE NEW ACCOUNT
  // Takes email and password, creates account in Firebase
  register(email: string, password: string, role?: 'mentee' | 'mentor' | 'both'): Observable<any> {
    const promise = createUserWithEmailAndPassword(this.auth, email, password);

    if (role) {
      return from(promise).pipe(
        concatMap((userCredential) =>
          this.saveUserRole(userCredential.user.uid, role).pipe(
            map(() => ({ user: userCredential.user, role }))
          )
        )
      );
    } else {
      return from(promise).pipe(
        map((userCredential) => ({ user: userCredential.user, role: null }))
      );
    }
  }

  // SIGN IN TO EXISTING ACCOUNT
  // Takes email and password, signs user in
  login(email: string, password: string): Observable<any> {
    const promise = signInWithEmailAndPassword(this.auth, email, password);
    return from(promise); // Convert promise to observable
  }

  // SIGN OUT
  // Signs current user out
  logout(): Observable<any> {
    const promise = signOut(this.auth);
    return from(promise); // Convert promise to observable
  }

  // GET CURRENT USER
  // Returns the currently signed-in user (or null if no one signed in)
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  // CHECK IF USER IS SIGNED IN
  // Returns true if someone is signed in, false if not
  isAuthenticated(): boolean {
    const authenticated = !!this.auth.currentUser;
    console.log('🔐 User authentication status:', authenticated, 'User:', this.auth.currentUser?.email);
    return authenticated;
  }

  // SAVE USER ROLE TO FIRESTORE
  saveUserRole(uid: string, role: 'mentee' | 'mentor' | 'both'): Observable<void> {
    const userDoc = doc(this.firestore, 'users', uid);
    return from(setDoc(userDoc, { role }));
  }

  // GET USER ROLE FROM FIRESTORE
  getUserRole(uid: string): Observable<string | null> {
    const userDoc = doc(this.firestore, 'users', uid);
    return from(getDoc(userDoc)).pipe(
      map((userDocSnap) => {
        return userDocSnap.exists() ? userDocSnap.data()['role'] : null;
      })
    );
  }

  // SEND PASSWORD RESET EMAIL
  sendPasswordResetEmail(email: string): Observable<void> {
    const promise = sendPasswordResetEmail(this.auth, email);
    return from(promise);
  }

  // DELETE USER ACCOUNT
  // Permanently deletes the current user account and signs them out
  deleteUserAccount(): Observable<void> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      throw new Error('No user is currently signed in');
    }
    const promise = deleteUser(currentUser);
    return from(promise);
  }
}
