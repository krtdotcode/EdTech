import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-coming-soon',
  imports: [CommonModule, RouterLink, Footer],
  templateUrl: './coming-soon.html',
  styleUrl: './coming-soon.scss'
})
export class ComingSoon {
  @Input() pageTitle: string = 'Coming Soon';
  @Input() featureTitle: string = 'Feature Coming Soon';
  @Input() description: string = 'This feature is currently under development and will be available soon.';
  @Input() icon: string = '🚀';
  @Input() features: { icon: string; title: string; description: string }[] = [];
  @Input() actions: { label: string; route: string }[] = [];
  @Input() dashboardRoute: string = '/mentee-dashboard'; // Default to mentee dashboard, parent can override

  constructor(private router: Router) {}

  goBackToDashboard(): void {
    // Use the specified or default dashboard route
    this.router.navigate([this.dashboardRoute]);
  }
}
