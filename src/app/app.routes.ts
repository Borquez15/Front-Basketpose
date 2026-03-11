import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  // Auth (sin guard)
  {
    path: 'auth',
    children: [
      { path: 'login',    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
    ]
  },

  // App (con guard)
  {
    path: 'app',
    canActivate: [authGuard],
    children: [
      { path: '',           redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',  loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },

      // Clases
      { path: 'clases',           loadComponent: () => import('./features/classes/class-list/class-list.component').then(m => m.ClassListComponent) },
      { path: 'clases/nueva',     loadComponent: () => import('./features/classes/create-class/create-class.component').then(m => m.CreateClassComponent) },
      { path: 'clases/:id',       loadComponent: () => import('./features/classes/class-detail/class-detail.component').then(m => m.ClassDetailComponent) },

      // Jugadores
      { path: 'jugadores',        loadComponent: () => import('./features/players/player-list/player-list.component').then(m => m.PlayerListComponent) },
      { path: 'jugadores/nuevo',  loadComponent: () => import('./features/players/add-player/add-player.component').then(m => m.AddPlayerComponent) },

      // Sesión en vivo
      { path: 'sesion',           loadComponent: () => import('./features/session/live-session/live-session.component').then(m => m.LiveSessionComponent) },

      // Análisis
      { path: 'analisis/:id',     loadComponent: () => import('./features/session/shot-analysis/shot-analysis.component').then(m => m.ShotAnalysisComponent) },

      // Reporte
      { path: 'reporte/:id',      loadComponent: () => import('./features/reports/progress-report/progress-report.component').then(m => m.ProgressReportComponent) },

      // Perfil
      { path: 'perfil',           loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },
    ]
  },

  { path: '**', redirectTo: 'auth/login' }
];
