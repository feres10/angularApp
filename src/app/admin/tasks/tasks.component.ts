import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../core/services/task.service';
import { extractList } from '../../core/utils/api-response';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { AuthService } from '../../core/services/auth.service';
import { ProjectService } from '../../core/services/project.service';
import { TeamService } from '../../core/services/team.service';
import { AdminService } from '../../core/services/admin.service';

interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string;
  assigneeId?: number;
  projectId?: number;
  teamId?: number;
  startDate: string;
  dueDate: string;
  progress: number;
}

type TaskStatusFilter = 'ALL' | 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type TaskPriorityFilter = 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface TaskFormData {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  dueDate: string;
  projectId: string;
  assignedEmployeeId: string;
  teamId: string;
}

interface SelectOption {
  id: string;
  label: string;
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  tasks: TaskItem[] = [];
  filteredTasks: TaskItem[] = [];
  projectOptions: SelectOption[] = [];
  employeeOptions: SelectOption[] = [];
  teamOptions: SelectOption[] = [];
  isCreateModalOpen = false;
  isEditModalOpen = false;
  createError = '';
  editError = '';
  searchTerm = '';
  selectedStatus: TaskStatusFilter = 'ALL';
  selectedPriority: TaskPriorityFilter = 'ALL';
  taskForm: TaskFormData = this.createEmptyForm();
  editTaskForm: TaskFormData = this.createEmptyForm();
  editingTaskId: string | null = null;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private projectService: ProjectService,
    private teamService: TeamService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.loadProjects();
    this.loadEmployees();
    this.loadTeams();
  }

  loadTasks(): void {
    this.taskService.getAllTasks(0, 100).subscribe({
      next: response => {
        this.tasks = extractList<any>(response).map(task => this.mapTask(task));
        this.applyFilters();
      },
      error: error => alert(error.error?.message ?? 'Unable to load tasks')
    });
  }

  loadProjects(): void {
    this.projectService.getProjects(0, 100).subscribe({
      next: response => {
        this.projectOptions = extractList<any>(response)
          .map(project => ({
            id: String(project.id ?? ''),
            label: project.name ?? project.title ?? ''
          }))
          .filter((project: SelectOption) => !!project.id && !!project.label);
      },
      error: () => {
        this.projectOptions = [];
      }
    });
  }

  loadEmployees(): void {
    this.adminService.getAllEmployees().subscribe({
      next: response => {
        this.employeeOptions = extractList<any>(response)
          .map(employee => ({
            id: String(employee.id ?? ''),
            label: `${employee.user?.firstname ?? employee.user?.firstName ?? ''} ${employee.user?.lastname ?? employee.user?.lastName ?? ''}`.trim()
          }))
          .filter((employee: SelectOption) => !!employee.id && !!employee.label);
      },
      error: () => {
        this.employeeOptions = [];
      }
    });
  }

  loadTeams(): void {
    this.teamService.getAllTeams(0, 100).subscribe({
      next: response => {
        this.teamOptions = extractList<any>(response)
          .map(team => ({
            id: String(team.id ?? ''),
            label: team.name ?? ''
          }))
          .filter((team: SelectOption) => !!team.id && !!team.label);
      },
      error: () => {
        this.teamOptions = [];
      }
    });
  }

  onCreateTask(): void {
    if (!this.authService.isAdmin()) {
      this.createError = 'Only an admin can create tasks. Please log in again with an admin account.';
      return;
    }

    this.taskForm = this.createEmptyForm();
    this.createError = '';
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
    this.createError = '';
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editError = '';
    this.editingTaskId = null;
  }

  onFiltersChange(): void {
    this.applyFilters();
  }

  submitCreateTask(): void {
    this.createError = '';

    if (!this.taskForm.title.trim()) {
      this.createError = 'Task title is required.';
      return;
    }

    if (this.taskForm.startDate && this.taskForm.dueDate && this.taskForm.startDate > this.taskForm.dueDate) {
      this.createError = 'Start date must be before end date.';
      return;
    }

    const projectId = Number(this.taskForm.projectId);
    if (!Number.isFinite(projectId) || projectId <= 0) {
      this.createError = 'Project is required.';
      return;
    }

    const assignedEmployeeId = Number(this.taskForm.assignedEmployeeId);
    const teamId = Number(this.taskForm.teamId);

    this.taskService.createTask({
      title: this.taskForm.title.trim(),
      description: this.taskForm.description.trim(),
      priority: this.taskForm.priority,
      startDate: this.taskForm.startDate || undefined,
      dueDate: this.taskForm.dueDate || undefined,
      projectId,
      assignedEmployeeId: Number.isFinite(assignedEmployeeId) && assignedEmployeeId > 0 ? assignedEmployeeId : undefined,
      teamId: Number.isFinite(teamId) && teamId > 0 ? teamId : undefined
    }).subscribe({
      next: () => {
        this.closeCreateModal();
        this.loadTasks();
      },
      error: error => {
        this.createError = error.status === 403
          ? 'Access denied. Your session may not have admin permission. Log out and log back in with an admin account.'
          : error.error?.message ?? 'Unable to create task';
      }
    });
  }

  onEditTask(taskId: string): void {
    const task = this.tasks.find(item => item.id === taskId);
    if (!task) return;
    this.editingTaskId = taskId;
    this.editError = '';
    this.editTaskForm = {
      title: task.title,
      description: task.description,
      priority: task.priority as TaskFormData['priority'],
      status: task.status as TaskFormData['status'],
      startDate: task.startDate,
      dueDate: task.dueDate,
      projectId: String(task.projectId ?? ''),
      assignedEmployeeId: String(task.assigneeId ?? ''),
      teamId: String(task.teamId ?? '')
    };
    this.isEditModalOpen = true;
  }

  submitEditTask(): void {
    if (!this.editingTaskId) return;

    this.editError = '';

    if (!this.editTaskForm.title.trim()) {
      this.editError = 'Task title is required.';
      return;
    }

    if (this.editTaskForm.startDate && this.editTaskForm.dueDate && this.editTaskForm.startDate > this.editTaskForm.dueDate) {
      this.editError = 'Start date must be before end date.';
      return;
    }

    const projectId = Number(this.editTaskForm.projectId);
    if (!Number.isFinite(projectId) || projectId <= 0) {
      this.editError = 'Project is required.';
      return;
    }

    const assignedEmployeeId = Number(this.editTaskForm.assignedEmployeeId);
    const teamId = Number(this.editTaskForm.teamId);

    this.taskService.updateTask(Number(this.editingTaskId), {
      title: this.editTaskForm.title.trim(),
      description: this.editTaskForm.description.trim(),
      priority: this.editTaskForm.priority,
      status: this.editTaskForm.status,
      startDate: this.editTaskForm.startDate || undefined,
      dueDate: this.editTaskForm.dueDate || undefined,
      projectId,
      assignedEmployeeId: Number.isFinite(assignedEmployeeId) && assignedEmployeeId > 0 ? assignedEmployeeId : undefined,
      teamId: Number.isFinite(teamId) && teamId > 0 ? teamId : undefined
    }).subscribe({
      next: () => {
        this.closeEditModal();
        this.loadTasks();
      },
      error: error => {
        this.editError = error.status === 403
          ? 'Access denied. Your session may not have admin permission.'
          : error.error?.message ?? 'Unable to update task';
      }
    });
  }

  onDeleteTask(taskId: string): void {
    if (!confirm('Delete this task?')) return;

    this.taskService.deleteTask(Number(taskId)).subscribe({
      next: () => this.loadTasks(),
      error: error => alert(error.error?.message ?? 'Unable to delete task')
    });
  }

  private mapTask(task: any): TaskItem {
    const status = task.status ?? 'TODO';
    const assignee = task.assignedEmployee?.user
      ? `${task.assignedEmployee.user.firstname ?? ''} ${task.assignedEmployee.user.lastname ?? ''}`.trim()
      : 'Unassigned';

    return {
      id: String(task.id),
      title: task.title ?? '',
      description: task.description ?? '',
      status,
      priority: task.priority ?? 'MEDIUM',
      assignee,
      assigneeId: task.assignedEmployee?.id,
      projectId: task.project?.id,
      teamId: task.team?.id,
      startDate: task.startDate ?? '',
      dueDate: task.dueDate ?? '',
      progress: status === 'COMPLETED' ? 100 : status === 'IN_PROGRESS' ? 50 : 0
    };
  }

  private applyFilters(): void {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();

    this.filteredTasks = this.tasks.filter(task => {
      const matchesSearch = !normalizedSearch
        || task.title.toLowerCase().includes(normalizedSearch)
        || task.description.toLowerCase().includes(normalizedSearch)
        || task.assignee.toLowerCase().includes(normalizedSearch);

      const matchesStatus = this.selectedStatus === 'ALL' || task.status === this.selectedStatus;
      const matchesPriority = this.selectedPriority === 'ALL' || task.priority === this.selectedPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }

  private createEmptyForm(): TaskFormData {
    return {
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'TODO',
      startDate: '',
      dueDate: '',
      projectId: '',
      assignedEmployeeId: '',
      teamId: ''
    };
  }
}
