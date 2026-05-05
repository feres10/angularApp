import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthResponse, LoginRequest, RegisterRequest, User, ApiResponse } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  register(request: RegisterRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/register`, request).pipe(
      map(response => {
        if (response.success && response.data) {
          const pendingUser: User = {
            id: response.data.userId,
            firstname: request.firstname,
            lastname: request.lastname,
            email: request.email,
            role: 'EMPLOYEE',
            status: 'PENDING',
            createdAt: new Date(),
            employeeType: request.employeeType
          };
          localStorage.setItem('currentUser', JSON.stringify(pendingUser));
          this.currentUserSubject.next(pendingUser);
        }
        return response;
      })
    );
  }

  login(request: LoginRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/login`, request).pipe(
      map(response => {
        if (response.success && response.data) {
          const authData = response.data as AuthResponse;
          this.setTokens(authData.accessToken, authData.refreshToken);
          this.setCurrentUser(authData);
        }
        return response;
      })
    );
  }

  logout(): Observable<ApiResponse> {
    const userId = this.getCurrentUser()?.id;
    return this.http.post<ApiResponse>(`${this.apiUrl}/logout?userId=${userId}`, {}).pipe(
      map(response => {
        this.forceLogout();
        return response;
      })
    );
  }

  refreshToken(refreshToken: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/refresh-token`, { refreshToken });
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
  }

  forceLogout(): void {
    this.clearTokens();
    this.currentUserSubject.next(null);
  }

  setCurrentUser(authData: any): void {
    const user: User = {
      id: authData.userId,
      firstname: authData.firstname,
      lastname: authData.lastname,
      email: authData.email,
      role: authData.role,
      status: authData.status,
      createdAt: new Date()
    };
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getRoleFromToken(): string | null {
    const payload = this.getTokenPayload();
    if (!payload) {
      return null;
    }

    return payload.role ?? null;
  }

  private getUserFromStorage(): User | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    const payload = this.getTokenPayload();
    if (!payload?.exp) {
      return !!this.getAccessToken();
    }

    return payload.exp * 1000 > Date.now();
  }

  isAdmin(): boolean {
    return (this.getRoleFromToken() ?? this.getCurrentUser()?.role) === 'ADMIN';
  }

  isEmployee(): boolean {
    return (this.getRoleFromToken() ?? this.getCurrentUser()?.role) === 'EMPLOYEE';
  }

  private getTokenPayload(): any | null {
    const token = this.getAccessToken();
    if (!token) {
      return null;
    }

    try {
      const payload = token.split('.')[1];
      if (!payload) {
        return null;
      }

      const normalized = payload
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(payload.length / 4) * 4, '=');

      return JSON.parse(atob(normalized));
    } catch {
      return null;
    }
  }

  isApproved(): boolean {
    return this.getCurrentUser()?.status === 'APPROVED';
  }
}
