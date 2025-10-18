import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './messages.html',
})
export class Messages {
  constructor(private router: Router) {}

  goBackToDashboard(): void {
    // For now, navigate to mentee dashboard as default
    // In a full implementation, this would check user role
    this.router.navigate(['/mentee-dashboard']);
  }
}
