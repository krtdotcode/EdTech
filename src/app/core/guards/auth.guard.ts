// This guard protects routes that require authentication
// It checks if user is signed in before allowing access to protected pages
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  // CHECK IF USER CAN ACCESS ROUTE
  canActivate(): Observable<boolean> {
    // Get user state and check if someone is signed in
    return this.authService.user$.pipe(
      take(1), // Only take one value from the observable
      map((user) => {
        if (user) {
          // USER IS SIGNED IN: Allow access
          return true;
        } else {
          // USER NOT SIGNED IN: Redirect to login page
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
}
