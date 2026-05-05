import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { TaskService } from '../../core/services/task.service';
import { NotificationService } from '../../core/services/notification.service';
import { ProjectService } from '../../core/services/project.service';
import { extractList, extractData } from '../../core/utils/api-response';

interface TaskItem {
  title: string;
  priority: string;
  dueDate: string;
  completed: boolean;
}

interface DeadlineItem {
  title: string;
  dueDate: string;
}

interface DashboardStats {
  myTasks: number;
  inProgress: number;
  myProjects: number;
  myTeams: number;
  unreadNotifications: number;
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
    myTasks: 0,
    inProgress: 0,
    myProjects: 0,
    myTeams: 0,
    unreadNotifications: 0
  };

  myTasks: TaskItem[] = [];
  upcomingDeadlines: DeadlineItem[] = [];

  constructor(
    private taskService: TaskService,
    private notificationService: NotificationService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    forkJoin({
      tasks: this.taskService.getMyTasks(0),
      projects: this.projectService.getMyProjects(0, 100),
      unread: this.notificationService.getUnreadCount()
    }).subscribe({
      next: ({ tasks, projects, unread }) => {
        const taskList = extractList<any>(tasks);
        const projectList = extractList<any>(projects);
        const unreadData = extractData<any>(unread);

        this.stats = {
          myTasks: taskList.length,
          inProgress: taskList.filter(task => task.status === 'IN_PROGRESS').length,
          myProjects: projectList.length,
          myTeams: 0,
          unreadNotifications: Number(unreadData?.count ?? unreadData ?? 0)
        };

        this.myTasks = taskList.slice(0, 5).map(task => ({
          title: task.title ?? '',
          priority: task.priority ?? 'MEDIUM',
          dueDate: task.dueDate ?? '',
          completed: task.status === 'COMPLETED'
        }));

        this.upcomingDeadlines = taskList
          .filter(task => task.dueDate)
          .slice(0, 5)
          .map(task => ({ title: task.title ?? '', dueDate: task.dueDate }));
      },
      error: error => alert(error.error?.message ?? 'Unable to load dashboard data')
    });
  }
}
