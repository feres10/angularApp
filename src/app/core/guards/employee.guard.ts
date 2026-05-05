import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const user = this.authService.getCurrentUser();
    if (user?.status === 'PENDING') {
      this.router.navigate(['/auth/waiting-approval']);
      return false;
    }

    if (!this.authService.isEmployee()) {
      this.router.navigate(['/admin/dashboard']);
      return false;
    }

    return true;
  }
}
