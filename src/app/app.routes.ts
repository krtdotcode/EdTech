import { Routes } from '@angular/router';
import { AuthGuard } from './shared/services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'matching', pathMatch: 'full' },
  { path: 'matching', loadComponent: () => import('./pages/matching/matching').then(m => m.Matching), canActivate: [AuthGuard] },
  { path: 'mentor-requests', loadComponent: () => import('./pages/mentor-requests/mentor-requests').then(m => m.MentorRequests), canActivate: [AuthGuard] },
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./pages/register/register').then(m => m.Register) },
  { path: 'profile', loadComponent: () => import('./pages/profile/profile').then(m => m.Profile), canActivate: [AuthGuard] },
  { path: 'admin', loadComponent: () => import('./pages/admin/admin').then(m => m.Admin), canActivate: [AuthGuard] },
  { path: 'feedback', loadComponent: () => import('./pages/feedback/feedback').then(m => m.Feedback), canActivate: [AuthGuard] },
  { path: 'forgot-password', loadComponent: () => import('./pages/forgot-password/forgot-password').then(m => m.ForgotPassword), canActivate: [AuthGuard] },
  { path: 'messages', loadComponent: () => import('./pages/messages/messages').then(m => m.Messages), canActivate: [AuthGuard] },
  { path: 'progress', loadComponent: () => import('./pages/progress/progress').then(m => m.Progress), canActivate: [AuthGuard] },
  { path: 'resources', loadComponent: () => import('./pages/resources/resources').then(m => m.Resources), canActivate: [AuthGuard] },
  { path: 'scheduling', loadComponent: () => import('./pages/scheduling/scheduling').then(m => m.Scheduling), canActivate: [AuthGuard] },
];
