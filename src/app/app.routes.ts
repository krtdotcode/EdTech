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
    path: 'signup',
    loadComponent: () => import('./pages/auth/signup/signup').then((m) => m.Signup),
  },
  {
    path: 'profile-completion',
    loadComponent: () =>
      import('./pages/profile-completion/profile-completion').then((m) => m.ProfileCompletion),
    canActivate: [AuthGuard],
  },
  {
    path: 'mentee-dashboard',
    loadComponent: () => import('./pages/mentee-dashboard/mentee-dashboard').then((m) => m.MenteeDashboard),
    canActivate: [AuthGuard],
  },
  {
    path: 'mentor-dashboard',
    loadComponent: () => import('./pages/mentor-dashboard/mentor-dashboard').then((m) => m.MentorDashboard),
    canActivate: [AuthGuard],
  },
  {
    path: 'matching',
    loadComponent: () => import('./pages/matching/matching').then((m) => m.Matching),
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
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
  {
    path: 'my-mentors',
    loadComponent: () =>
      import('./pages/my-mentors/my-mentors').then((m) => m.MyMentors),
    canActivate: [AuthGuard],
  },
  {
    path: 'my-mentees',
    loadComponent: () =>
      import('./pages/my-mentees/my-mentees').then((m) => m.MyMentees),
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: '/login' }, // Wildcard route for any unmatched URL
];
