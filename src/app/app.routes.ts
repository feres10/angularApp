import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { EmployeeGuard } from './core/guards/employee.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/landing',
    pathMatch: 'full'
  },
  {
    path: 'landing',
    loadComponent: () => import('./landing/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'waiting-approval',
        loadComponent: () => import('./auth/waiting-approval/waiting-approval.component').then(m => m.WaitingApprovalComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    loadComponent: () => import('./shared/layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./admin/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'employees',
        loadComponent: () => import('./admin/employees/employees.component').then(m => m.EmployeesComponent)
      },
      {
        path: 'projects',
        loadComponent: () => import('./admin/projects/projects.component').then(m => m.ProjectsComponent)
      },
      {
        path: 'tasks',
        loadComponent: () => import('./admin/tasks/tasks.component').then(m => m.TasksComponent)
      },
      {
        path: 'teams',
        loadComponent: () => import('./admin/teams/teams.component').then(m => m.TeamsComponent)
      },
      {
        path: 'calendar',
        loadComponent: () => import('./admin/calendar/calendar.component').then(m => m.CalendarComponent)
      },
      {
        path: 'chats',
        loadComponent: () => import('./admin/chats/chats.component').then(m => m.ChatsComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./admin/notifications/notifications.component').then(m => m.NotificationsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./employee/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./admin/settings/settings.component').then(m => m.SettingsComponent)
      }
    ]
  },
  {
    path: 'employee',
    canActivate: [AuthGuard, EmployeeGuard],
    loadComponent: () => import('./shared/layouts/employee-layout/employee-layout.component').then(m => m.EmployeeLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./employee/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'my-tasks',
        loadComponent: () => import('./employee/my-tasks/my-tasks.component').then(m => m.MyTasksComponent)
      },
      {
        path: 'my-projects',
        loadComponent: () => import('./employee/my-projects/my-projects.component').then(m => m.MyProjectsComponent)
      },
      {
        path: 'my-calendar',
        loadComponent: () => import('./employee/my-calendar/my-calendar.component').then(m => m.MyCalendarComponent)
      },
      {
        path: 'my-team',
        loadComponent: () => import('./employee/my-team/my-team.component').then(m => m.MyTeamComponent)
      },
      {
        path: 'chat',
        loadComponent: () => import('./employee/chat/chat.component').then(m => m.ChatComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./employee/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./employee/notifications/notifications.component').then(m => m.NotificationsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/landing'
  }
];
