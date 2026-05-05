import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  pageTitle = 'Dashboard';
  userName = 'User';
  userRole = 'Employee';
  unreadNotifications = 0;
  showUserMenu = false;
  profileRoute = '/employee/profile';
  settingsRoute = '/admin/settings';

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userName = currentUser.firstname + ' ' + currentUser.lastname;
      this.userRole = currentUser.role || 'Employee';
      this.profileRoute = currentUser.role === 'ADMIN' ? '/admin/profile' : '/employee/profile';
      this.settingsRoute = currentUser.role === 'ADMIN' ? '/admin/settings' : '/employee/profile';
    }

    // Subscribe to unread notifications
    // this.notificationService.getUnreadCount().subscribe(count => {
    //   this.unreadNotifications = count;
    // });
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  toggleSidebar(): void {
    // Implement sidebar toggle for mobile
  }

  navigateToUserRoute(route: string): void {
    this.showUserMenu = false;
    this.router.navigate([route]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
