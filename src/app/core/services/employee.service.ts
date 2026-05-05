import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee, ApiResponse, PaginatedResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly API_URL = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) {}

  getEmployees(page: number = 0, size: number = 10): Observable<PaginatedResponse<Employee>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PaginatedResponse<Employee>>(this.API_URL, { params });
  }

  getEmployeeById(id: number): Observable<ApiResponse<Employee>> {
    return this.http.get<ApiResponse<Employee>>(`${this.API_URL}/${id}`);
  }

  createEmployee(employee: Partial<Employee>): Observable<ApiResponse<Employee>> {
    return this.http.post<ApiResponse<Employee>>(this.API_URL, employee);
  }

  updateEmployee(id: number, employee: Partial<Employee>): Observable<ApiResponse<Employee>> {
    return this.http.put<ApiResponse<Employee>>(`${this.API_URL}/${id}`, employee);
  }

  deleteEmployee(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/${id}`);
  }

  searchEmployees(keyword: string): Observable<PaginatedResponse<Employee>> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<PaginatedResponse<Employee>>(`${this.API_URL}/search`, { params });
  }

  getEmployeesByDepartment(department: string): Observable<ApiResponse<Employee[]>> {
    return this.http.get<ApiResponse<Employee[]>>(`${this.API_URL}/department/${department}`);
  }
}
