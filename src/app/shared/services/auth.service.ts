// This service handles all authentication operations with Firebase
// It's like a bridge between your app and Firebase's authentication system
import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  user,
  User,
} from '@angular/fire/auth';
import { Observable, from, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // This observable tracks the current user state
  // It automatically updates when user logs in/out
  user$: Observable<User | null>;

  constructor(private auth: Auth) {
    this.user$ = user(this.auth);
  }

  // CREATE NEW ACCOUNT
  // Takes email and password, creates account in Firebase
  register(email: string, password: string, role: 'mentee' | 'mentor' | 'both'): Observable<any> {
    const promise = createUserWithEmailAndPassword(this.auth, email, password);
    return from(promise).pipe(
      map((userCredential) => {
        // You might want to save the role to a database here, or as a custom claim
        // For now, we'll just return the user credential and role
        return { user: userCredential.user, role };
      })
    );
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
    return !!this.auth.currentUser; // !! converts to boolean
  }
}
