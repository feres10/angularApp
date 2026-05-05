import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TaskService } from '../../core/services/task.service';
import { ProjectService } from '../../core/services/project.service';
import { AdminService } from '../../core/services/admin.service';
import { UserService } from '../../core/services/user.service';
import { extractList } from '../../core/utils/api-response';

interface DashboardStats {
  totalUsers: number;
  totalEmployees: number;
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
}

interface ActivityItem {
  icon: string;
  message: string;
  timestamp: string;
}

interface LoadResult {
  data: unknown;
  error: string | null;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalUsers: 0,
    totalEmployees: 0,
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0
  };

  recentActivities: ActivityItem[] = [];
  isLoading = false;
  loadWarnings: string[] = [];

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private adminService: AdminService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.loadWarnings = [];

    forkJoin({
      users: this.wrapSource('users', this.userService.getAllUsers(0, 100)),
      employees: this.wrapSource('employees', this.adminService.getAllEmployees()),
      projects: this.wrapSource('projects', this.projectService.getProjects(0, 100)),
      tasks: this.wrapSource('tasks', this.taskService.getAllTasks(0, 100))
    }).subscribe({
      next: ({ users, employees, projects, tasks }) => {
        const userList = extractList<any>(users.data);
        const employeeList = extractList<any>(employees.data);
        const projectList = extractList<any>(projects.data);
        const taskList = extractList<any>(tasks.data);

        this.stats = {
          totalUsers: userList.length,
          totalEmployees: employeeList.length,
          totalProjects: projectList.length,
          totalTasks: taskList.length,
          completedTasks: taskList.filter(task => task.status === 'COMPLETED').length
        };

        this.recentActivities = taskList.slice(0, 5).map(task => ({
          icon: 'TS',
          message: `Task: ${task.title}`,
          timestamp: task.updatedAt ?? task.createdAt ?? ''
        }));

        this.loadWarnings = [users, employees, projects, tasks]
          .filter(result => result.error)
          .map(result => result.error!);
        this.isLoading = false;
      },
      error: () => {
        this.loadWarnings = ['Unable to load dashboard data right now.'];
        this.isLoading = false;
      }
    });
  }

  private wrapSource(label: string, source: Observable<unknown>) {
    return source.pipe(
      map((data: unknown): LoadResult => ({ data, error: null })),
      catchError((error: any) =>
        of<LoadResult>({
          data: [],
          error: error?.error?.message ?? `Unable to load ${label}`
        })
      )
    );
  }
}
