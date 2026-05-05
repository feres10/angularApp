import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getAccessToken();
    const isAuthRequest = request.url.includes('/api/auth/');
    
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        const shouldRefreshToken =
          !isAuthRequest &&
          !!token &&
          error.status === 401;

        if (shouldRefreshToken) {
          const refreshToken = this.authService.getRefreshToken();
          if (refreshToken) {
            return this.authService.refreshToken(refreshToken).pipe(
              switchMap((response: any) => {
                if (response.success && response.data?.accessToken) {
                  const newToken = response.data.accessToken;
                  this.authService.setTokens(newToken, response.data.refreshToken);
                  
                  request = request.clone({
                    setHeaders: {
                      Authorization: `Bearer ${newToken}`
                    }
                  });
                  
                  return next.handle(request);
                }
                return throwError(() => error);
              }),
              catchError(() => {
                this.authService.forceLogout();
                this.router.navigate(['/auth/login']);
                return throwError(() => error);
              })
            );
          }

          this.authService.forceLogout();
          this.router.navigate(['/auth/login']);
        }

        return throwError(() => error);
      })
    );
  }
}
