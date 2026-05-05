import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../core/services/task.service';
import { extractList } from '../../core/utils/api-response';

interface MyTaskItem {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate: string;
  completed: boolean;
}

@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-tasks.component.html',
  styleUrls: ['./my-tasks.component.css']
})
export class MyTasksComponent implements OnInit {
  myTasks: MyTaskItem[] = [];

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadMyTasks();
  }

  loadMyTasks(): void {
    this.taskService.getMyTasks(0).subscribe({
      next: response => {
        this.myTasks = extractList<any>(response).map(task => ({
          id: String(task.id),
          title: task.title ?? '',
          description: task.description ?? '',
          priority: task.priority ?? 'MEDIUM',
          status: task.status ?? 'TODO',
          dueDate: task.dueDate ?? '',
          completed: task.status === 'COMPLETED'
        }));
      },
      error: error => alert(error.error?.message ?? 'Unable to load your tasks')
    });
  }

  onEditTask(taskId: string): void {
    const task = this.myTasks.find(item => item.id === taskId);
    if (!task) return;
    const status = (prompt('Status: TODO, IN_PROGRESS, COMPLETED, CANCELLED', task.status) ?? task.status).toUpperCase().replace(' ', '_');
    this.taskService.updateTaskStatus(Number(taskId), status).subscribe({
      next: () => this.loadMyTasks(),
      error: error => alert(error.error?.message ?? 'Unable to update task status')
    });
  }

  onToggleTask(taskId: string): void {
    const task = this.myTasks.find(item => item.id === taskId);
    if (!task) return;
    const status = task.completed ? 'TODO' : 'COMPLETED';
    this.taskService.updateTaskStatus(Number(taskId), status).subscribe({
      next: () => this.loadMyTasks(),
      error: error => alert(error.error?.message ?? 'Unable to update task status')
    });
  }
}
