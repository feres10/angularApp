import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isAuthenticated()) {
      const requiredRole = route.data['role'];
      if (requiredRole && this.authService.getCurrentUser()?.role !== requiredRole) {
        this.router.navigate(['/unauthorized']);
        return false;
      }
      return true;
    }
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredRole = route.data['role'];
    const currentUser = this.authService.getCurrentUser();

    if (currentUser && currentUser.role === requiredRole) {
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ApprovedGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const currentUser = this.authService.getCurrentUser();

    if (currentUser && currentUser.status === 'APPROVED') {
      return true;
    }

    this.router.navigate(['/pending']);
    return false;
  }
}
