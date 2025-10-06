import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  constructor(private router: Router) {}

  // Navigate to login page
  goToLogin() {
    this.router.navigate(['/login']);
  }

  // Navigate to register page
  goToRegister() {
    this.router.navigate(['/register']);
  }
}
