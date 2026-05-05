import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, ApiResponse, PaginatedResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly API_URL = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  getProjects(page: number = 0, size: number = 10): Observable<PaginatedResponse<Project>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PaginatedResponse<Project>>(this.API_URL, { params });
  }

  getProjectById(id: number): Observable<ApiResponse<Project>> {
    return this.http.get<ApiResponse<Project>>(`${this.API_URL}/${id}`);
  }

  createProject(project: Partial<Project>): Observable<ApiResponse<Project>> {
    return this.http.post<ApiResponse<Project>>(this.API_URL, project);
  }

  updateProject(id: number, project: Partial<Project>): Observable<ApiResponse<Project>> {
    return this.http.put<ApiResponse<Project>>(`${this.API_URL}/${id}`, project);
  }

  deleteProject(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/${id}`);
  }

  searchProjects(keyword: string): Observable<PaginatedResponse<Project>> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<PaginatedResponse<Project>>(`${this.API_URL}/search`, { params });
  }

  getMyProjects(page: number = 0, size: number = 10): Observable<PaginatedResponse<Project>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PaginatedResponse<Project>>(`${this.API_URL}/my-projects`, { params });
  }
}
