import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, Employee, ApiResponse } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) { }

  // Pending Requests
  getPendingRequests(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/pending-requests`);
  }

  approveUser(userId: number): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/approve/${userId}`, {});
  }

  rejectUser(userId: number): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/reject/${userId}`, {});
  }

  // Employee Management
  createEmployee(request: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/employees`, request);
  }

  getAllEmployees(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/employees`);
  }

  getEmployeeById(id: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/employees/${id}`);
  }

  updateEmployee(id: number, request: any): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/employees/${id}`, request);
  }

  deleteEmployee(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/employees/${id}`);
  }

  // Category Management
  createCategory(request: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/categories`, request);
  }

  getAllCategories(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/categories`);
  }

  getCategoryById(id: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/categories/${id}`);
  }

  updateCategory(id: number, request: any): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/categories/${id}`, request);
  }

  deleteCategory(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/categories/${id}`);
  }

  // Statistics
  getEmployeeStatistics(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/statistics/employees`);
  }
}
