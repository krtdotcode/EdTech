import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Default route
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  { path: 'login', loadComponent: () => import('./pages/auth/login/login').then((m) => m.Login) },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/auth/forgot-password/forgot-password').then((m) => m.ForgotPassword),
    canActivate: [AuthGuard],
  },
  {
    path: 'profile-completion',
    loadComponent: () =>
      import('./pages/profile-completion/profile-completion').then((m) => m.ProfileCompletion),
    canActivate: [AuthGuard],
  },
  {
    path: 'mentee-dashboard',
    loadComponent: () => import('./pages/matching/matching').then((m) => m.Matching),
    canActivate: [AuthGuard],
  }, // Assuming matching is mentee dashboard
  {
    path: 'mentor-dashboard',
    loadComponent: () =>
      import('./pages/mentor-requests/mentor-requests').then((m) => m.MentorRequests),
    canActivate: [AuthGuard],
  }, // Assuming mentor-requests is mentor dashboard
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
    canActivate: [AuthGuard],
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin').then((m) => m.Admin),
    canActivate: [AuthGuard],
  },
  {
    path: 'feedback',
    loadComponent: () => import('./pages/feedback/feedback').then((m) => m.Feedback),
    canActivate: [AuthGuard],
  },
  {
    path: 'messages',
    loadComponent: () => import('./pages/messages/messages').then((m) => m.Messages),
    canActivate: [AuthGuard],
  },
  {
    path: 'progress',
    loadComponent: () => import('./pages/progress/progress').then((m) => m.Progress),
    canActivate: [AuthGuard],
  },
  {
    path: 'resources',
    loadComponent: () => import('./pages/resources/resources').then((m) => m.Resources),
    canActivate: [AuthGuard],
  },
  {
    path: 'scheduling',
    loadComponent: () => import('./pages/scheduling/scheduling').then((m) => m.Scheduling),
    canActivate: [AuthGuard],
  },
  {
    path: 'mentor-requests',
    loadComponent: () =>
      import('./pages/mentor-requests/mentor-requests').then((m) => m.MentorRequests),
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: '/login' }, // Wildcard route for any unmatched URL
];
