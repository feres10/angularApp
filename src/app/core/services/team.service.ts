import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TeamRequest {
  name: string;
  description?: string;
  leaderId?: number;
}

export interface TeamResponse {
  id: number;
  name: string;
  description?: string;
  leader?: any;
  memberCount: number;
  members?: any[];
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = `${environment.apiUrl}/teams`;

  constructor(private http: HttpClient) { }

  createTeam(request: TeamRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}`, request);
  }

  getAllTeams(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get(`${this.apiUrl}`, { params });
  }

  getTeamById(id: number): Observable<TeamResponse> {
    return this.http.get<TeamResponse>(`${this.apiUrl}/${id}`);
  }

  updateTeam(id: number, request: TeamRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, request);
  }

  deleteTeam(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  addMemberToTeam(teamId: number, employeeId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${teamId}/add-member/${employeeId}`, {});
  }

  removeMemberFromTeam(teamId: number, employeeId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${teamId}/remove-member/${employeeId}`, {});
  }

  searchTeams(keyword: string, page: number = 0): Observable<any> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString());
    return this.http.get(`${this.apiUrl}/search`, { params });
  }
}
