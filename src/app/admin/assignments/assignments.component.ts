import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../core/services/task.service';
import { extractList } from '../../core/utils/api-response';

interface AssignmentItem {
  id: string;
  taskName: string;
  assignedTo: string;
  dueDate: string;
  priority: string;
  status: string;
  progress: number;
  projectId?: number;
}

@Component({
  selector: 'app-assignments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.css']
})
export class AssignmentsComponent implements OnInit {
  assignments: AssignmentItem[] = [];

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadAssignments();
  }

  loadAssignments(): void {
    this.taskService.getAllTasks(0, 100).subscribe({
      next: response => {
        this.assignments = extractList<any>(response).map(task => {
          const status = task.status ?? 'TODO';
          return {
            id: String(task.id),
            taskName: task.title ?? '',
            assignedTo: task.assignedEmployee?.user
              ? `${task.assignedEmployee.user.firstname ?? ''} ${task.assignedEmployee.user.lastname ?? ''}`.trim()
              : 'Unassigned',
            dueDate: task.dueDate ?? '',
            priority: task.priority ?? 'MEDIUM',
            status,
            progress: status === 'COMPLETED' ? 100 : status === 'IN_PROGRESS' ? 50 : 0,
            projectId: task.project?.id
          };
        });
      },
      error: error => alert(error.error?.message ?? 'Unable to load assignments')
    });
  }

  onAssignTask(): void {
    const title = prompt('Task title');
    if (!title) return;
    const projectId = Number(prompt('Project ID'));
    if (!Number.isFinite(projectId)) return;
    const assignedEmployeeId = Number(prompt('Assigned employee ID'));
    if (!Number.isFinite(assignedEmployeeId)) return;

    this.taskService.createTask({
      title,
      description: '',
      priority: 'MEDIUM',
      projectId,
      assignedEmployeeId
    }).subscribe({
      next: () => this.loadAssignments(),
      error: error => alert(error.error?.message ?? 'Unable to assign task')
    });
  }

  onEditAssignment(assignmentId: string): void {
    const assignment = this.assignments.find(item => item.id === assignmentId);
    if (!assignment) return;
    const status = (prompt('Status: TODO, IN_PROGRESS, COMPLETED, CANCELLED', assignment.status) ?? assignment.status).toUpperCase().replace(' ', '_');
    this.taskService.updateTaskStatus(Number(assignmentId), status).subscribe({
      next: () => this.loadAssignments(),
      error: error => alert(error.error?.message ?? 'Unable to update assignment')
    });
  }

  onDeleteAssignment(assignmentId: string): void {
    if (!confirm('Delete this assignment task?')) return;
    this.taskService.deleteTask(Number(assignmentId)).subscribe({
      next: () => this.loadAssignments(),
      error: error => alert(error.error?.message ?? 'Unable to delete assignment')
    });
  }
}
