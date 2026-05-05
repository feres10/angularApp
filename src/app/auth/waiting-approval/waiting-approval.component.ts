import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-waiting-approval',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './waiting-approval.component.html',
  styleUrls: ['./waiting-approval.component.css']
})
export class WaitingApprovalComponent implements OnInit {
  userEmail: string = '';
  userName: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get user info from auth service or local storage
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userEmail = currentUser.email;
      this.userName = currentUser.firstname + ' ' + currentUser.lastname;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
