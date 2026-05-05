import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TaskRequest {
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startDate?: string;
  dueDate?: string;
  assignedEmployeeId?: number;
  projectId: number;
  teamId?: number;
}

export interface TaskResponse {
  id: number;
  title: string;
  description?: string;
  priority: string;
  status: string;
  startDate?: string;
  dueDate?: string;
  assignedEmployee?: any;
  project?: any;
  team?: any;
  isOverdue: boolean;
  isDueToday: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) { }

  createTask(request: TaskRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}`, request);
  }

  getAllTasks(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get(`${this.apiUrl}`, { params });
  }

  getTaskById(id: number): Observable<TaskResponse> {
    return this.http.get<TaskResponse>(`${this.apiUrl}/${id}`);
  }

  updateTask(id: number, request: TaskRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, request);
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getTasksByStatus(status: string, page: number = 0): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString());
    return this.http.get(`${this.apiUrl}/status/${status}`, { params });
  }

  getTasksByPriority(priority: string, page: number = 0): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString());
    return this.http.get(`${this.apiUrl}/priority/${priority}`, { params });
  }

  getUrgentTasks(page: number = 0): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString());
    return this.http.get(`${this.apiUrl}/urgent`, { params });
  }

  getOverdueTasks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/overdue`);
  }

  updateTaskStatus(taskId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${taskId}/status`, { status });
  }

  getMyTasks(page: number = 0): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString());
    return this.http.get(`${this.apiUrl}/my-tasks`, { params });
  }

  getMyTeamTasks(page: number = 0): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString());
    return this.http.get(`${this.apiUrl}/team-tasks`, { params });
  }

  getTasksForCalendar(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get(`${this.apiUrl}/calendar`, { params });
  }

  getProjectTasks(projectId: number, page: number = 0): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString());
    return this.http.get(`${this.apiUrl}/project/${projectId}`, { params });
  }

  getTeamTasks(teamId: number, page: number = 0): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString());
    return this.http.get(`${this.apiUrl}/team/${teamId}`, { params });
  }
}
