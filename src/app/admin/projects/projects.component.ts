import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../core/services/project.service';
import { extractList } from '../../core/utils/api-response';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { TeamService } from '../../core/services/team.service';

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  status: string;
  manager: string;
  teamId: string;
  teamName: string;
  teamSize: number;
  dueDate: string;
  startDate: string;
  progress: number;
}

interface TeamOption {
  id: string;
  name: string;
}

interface ProjectFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  teamId: string;
}

type ProjectStatusFilter = 'ALL' | 'ACTIVE' | 'COMPLETED' | 'IN_PROGRESS' | 'ON_HOLD' | 'PLANNING';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <div class="projects-container">
      <div class="section-header">
        <div class="header-content">
          <h1>Projects Management</h1>
          <p>Manage all projects in your organization</p>
        </div>
        <button class="btn-primary" (click)="onAddProject()">+ New Project</button>
      </div>

      <div class="filters-bar">
        <input
          type="text"
          placeholder="Search projects..."
          class="search-input"
          [(ngModel)]="searchTerm"
          (ngModelChange)="applyFilters()"
        />
        <select class="filter-select" [(ngModel)]="selectedStatus" (ngModelChange)="applyFilters()">
          <option value="ALL">All Status</option>
          <option value="PLANNING">Planning</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="COMPLETED">Completed</option>
          <option value="ACTIVE">Active</option>
        </select>
        <select class="filter-select" [(ngModel)]="selectedTeamId" (ngModelChange)="applyFilters()">
          <option value="">All Teams</option>
          <option *ngFor="let team of teamOptions" [value]="team.id">{{ team.name }}</option>
        </select>
      </div>

      <div class="projects-grid">
        <div class="project-card" *ngFor="let project of filteredProjects">
          <div class="card-header">
            <h3>{{ project.name }}</h3>
            <span class="status-badge" [class]="'status-' + project.status.toLowerCase()">{{ project.status }}</span>
          </div>
          <p class="project-description">{{ project.description }}</p>
          <div class="project-info">
            <div class="info-item">
              <span class="label">Manager</span>
              <span class="value">{{ project.manager }}</span>
            </div>
            <div class="info-item">
              <span class="label">Team</span>
              <span class="value">{{ project.teamName || 'No team' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Due Date</span>
              <span class="value">{{ project.dueDate }}</span>
            </div>
          </div>
          <div class="card-footer">
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="project.progress"></div>
            </div>
            <span class="progress-text">{{ project.progress }}% Complete</span>
          </div>
          <div class="card-actions">
            <button class="action-btn edit" title="Edit" (click)="onEditProject(project.id)">Edit</button>
            <button class="action-btn view" title="View Details" (click)="onViewProject(project.id)">View</button>
            <button class="action-btn delete" title="Delete" (click)="onDeleteProject(project.id)">Delete</button>
          </div>
        </div>
        <p *ngIf="filteredProjects.length === 0">No projects found.</p>
      </div>
    </div>

    <app-modal
      [isOpen]="isCreateModalOpen"
      [title]="'New Project'"
      [confirmText]="'Create Project'"
      [cancelText]="'Cancel'"
      [isConfirmDisabled]="!projectForm.name"
      (confirm)="submitCreateProject()"
      (close)="closeCreateModal()"
    >
      <div class="project-form">
        <div class="form-row">
          <label for="projectName">Project Name</label>
          <input id="projectName" type="text" [(ngModel)]="projectForm.name" name="projectName" />
        </div>

        <div class="form-row">
          <label for="projectDescription">Description</label>
          <textarea id="projectDescription" rows="4" [(ngModel)]="projectForm.description" name="projectDescription"></textarea>
        </div>

        <div class="form-grid">
          <div class="form-row">
            <label for="startDate">Start Date</label>
            <input id="startDate" type="date" [(ngModel)]="projectForm.startDate" name="startDate" />
          </div>

          <div class="form-row">
            <label for="endDate">End Date</label>
            <input id="endDate" type="date" [(ngModel)]="projectForm.endDate" name="endDate" />
          </div>
        </div>

        <div class="form-row">
          <label for="teamId">Assign Team</label>
          <select id="teamId" [(ngModel)]="projectForm.teamId" name="teamId">
            <option value="">No team</option>
            <option *ngFor="let team of teamOptions" [value]="team.id">{{ team.name }}</option>
          </select>
        </div>

        <p class="form-error" *ngIf="formError">{{ formError }}</p>
      </div>
    </app-modal>

    <app-modal
      [isOpen]="isViewModalOpen"
      [title]="selectedProject ? selectedProject.name : 'Project Details'"
      [confirmText]="'Close'"
      [cancelText]="'Cancel'"
      [showCancelButton]="false"
      (confirm)="closeViewModal()"
      (close)="closeViewModal()"
    >
      <div class="project-form" *ngIf="selectedProject">
        <div class="details-block">
          <p><strong>Description:</strong> {{ selectedProject.description || 'No description' }}</p>
          <p><strong>Status:</strong> {{ selectedProject.status }}</p>
          <p><strong>Team:</strong> {{ selectedProject.teamName || 'No team assigned' }}</p>
          <p><strong>Start Date:</strong> {{ selectedProject.startDate || 'Not set' }}</p>
          <p><strong>Due Date:</strong> {{ selectedProject.dueDate || 'Not set' }}</p>
          <p><strong>Progress:</strong> {{ selectedProject.progress }}%</p>
        </div>
      </div>
    </app-modal>

    <app-modal
      [isOpen]="isEditModalOpen"
      [title]="'Edit Project'"
      [confirmText]="'Save Changes'"
      [cancelText]="'Cancel'"
      [isConfirmDisabled]="!projectForm.name"
      (confirm)="submitEditProject()"
      (close)="closeEditModal()"
    >
      <div class="project-form">
        <div class="form-row">
          <label for="editProjectName">Project Name</label>
          <input id="editProjectName" type="text" [(ngModel)]="projectForm.name" name="editProjectName" />
        </div>

        <div class="form-row">
          <label for="editProjectDescription">Description</label>
          <textarea id="editProjectDescription" rows="4" [(ngModel)]="projectForm.description" name="editProjectDescription"></textarea>
        </div>

        <div class="form-grid">
          <div class="form-row">
            <label for="editStartDate">Start Date</label>
            <input id="editStartDate" type="date" [(ngModel)]="projectForm.startDate" name="editStartDate" />
          </div>

          <div class="form-row">
            <label for="editEndDate">End Date</label>
            <input id="editEndDate" type="date" [(ngModel)]="projectForm.endDate" name="editEndDate" />
          </div>
        </div>

        <div class="form-row">
          <label for="editTeamId">Assign Team</label>
          <select id="editTeamId" [(ngModel)]="projectForm.teamId" name="editTeamId">
            <option value="">No team</option>
            <option *ngFor="let team of teamOptions" [value]="team.id">{{ team.name }}</option>
          </select>
        </div>

        <p class="form-error" *ngIf="formError">{{ formError }}</p>
      </div>
    </app-modal>

    <app-modal
      [isOpen]="isDeleteModalOpen"
      [title]="'Delete Project'"
      [confirmText]="'Delete'"
      [cancelText]="'Cancel'"
      (confirm)="confirmDeleteProject()"
      (close)="closeDeleteModal()"
    >
      <div class="project-form" *ngIf="selectedProject">
        <p class="delete-copy">Are you sure you want to delete <strong>{{ selectedProject.name }}</strong>?</p>
        <p class="form-error" *ngIf="deleteError">{{ deleteError }}</p>
      </div>
    </app-modal>
  `,
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  projects: ProjectItem[] = [];
  filteredProjects: ProjectItem[] = [];
  teamOptions: TeamOption[] = [];
  searchTerm = '';
  selectedStatus: ProjectStatusFilter = 'ALL';
  selectedTeamId = '';

  isCreateModalOpen = false;
  isViewModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;

  selectedProject: ProjectItem | null = null;
  projectForm: ProjectFormData = this.createEmptyForm();
  formError = '';
  deleteError = '';

  constructor(
    private projectService: ProjectService,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadTeams();
  }

  loadProjects(): void {
    this.projectService.getProjects(0, 100).subscribe({
      next: response => {
        this.projects = extractList<any>(response).map(project => this.mapProject(project));
        this.applyFilters();
      },
      error: error => alert(error.error?.message ?? 'Unable to load projects')
    });
  }

  loadTeams(): void {
    this.teamService.getAllTeams(0, 100).subscribe({
      next: response => {
        this.teamOptions = extractList<any>(response).map(team => ({
          id: String(team.id ?? ''),
          name: team.name ?? ''
        })).filter((team: TeamOption) => !!team.id && !!team.name);
      },
      error: () => {
        this.teamOptions = [];
        this.applyFilters();
      }
    });
  }

  applyFilters(): void {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();

    this.filteredProjects = this.projects.filter(project => {
      const matchesSearch = !normalizedSearch
        || project.name.toLowerCase().includes(normalizedSearch)
        || project.description.toLowerCase().includes(normalizedSearch)
        || project.manager.toLowerCase().includes(normalizedSearch)
        || project.teamName.toLowerCase().includes(normalizedSearch);

      const matchesStatus = this.selectedStatus === 'ALL' || project.status === this.selectedStatus;
      const matchesTeam = !this.selectedTeamId || project.teamId === this.selectedTeamId;

      return matchesSearch && matchesStatus && matchesTeam;
    });
  }

  onAddProject(): void {
    this.projectForm = this.createEmptyForm();
    this.formError = '';
    this.isCreateModalOpen = true;
  }

  onEditProject(projectId: string): void {
    const project = this.projects.find(item => item.id === projectId);
    if (!project) return;

    this.selectedProject = project;
    this.projectForm = {
      name: project.name,
      description: project.description,
      startDate: project.startDate,
      endDate: project.dueDate,
      teamId: project.teamId
    };
    this.formError = '';
    this.isEditModalOpen = true;
  }

  onViewProject(projectId: string): void {
    const project = this.projects.find(item => item.id === projectId);
    if (!project) return;

    this.selectedProject = project;
    this.isViewModalOpen = true;
  }

  onDeleteProject(projectId: string): void {
    const project = this.projects.find(item => item.id === projectId);
    if (!project) return;

    this.selectedProject = project;
    this.deleteError = '';
    this.isDeleteModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
    this.formError = '';
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.formError = '';
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.deleteError = '';
  }

  submitCreateProject(): void {
    this.formError = '';
    if (!this.projectForm.name.trim()) {
      this.formError = 'Project name is required.';
      return;
    }

    this.projectService.createProject(this.buildPayload()).subscribe({
      next: () => {
        this.closeCreateModal();
        this.loadProjects();
      },
      error: error => {
        this.formError = error.error?.message ?? 'Unable to create project';
      }
    });
  }

  submitEditProject(): void {
    if (!this.selectedProject) return;

    this.formError = '';
    if (!this.projectForm.name.trim()) {
      this.formError = 'Project name is required.';
      return;
    }

    this.projectService.updateProject(Number(this.selectedProject.id), this.buildPayload()).subscribe({
      next: () => {
        this.closeEditModal();
        this.loadProjects();
      },
      error: error => {
        this.formError = error.error?.message ?? 'Unable to update project';
      }
    });
  }

  confirmDeleteProject(): void {
    if (!this.selectedProject) return;

    this.deleteError = '';
    this.projectService.deleteProject(Number(this.selectedProject.id)).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadProjects();
      },
      error: error => {
        this.deleteError = error.error?.message ?? 'Unable to delete project';
      }
    });
  }

  private buildPayload(): any {
    const teamId = Number(this.projectForm.teamId);
    return {
      name: this.projectForm.name.trim(),
      description: this.projectForm.description.trim(),
      startDate: (this.projectForm.startDate || undefined) as any,
      endDate: (this.projectForm.endDate || undefined) as any,
      teamId: Number.isFinite(teamId) && teamId > 0 ? teamId : undefined
    };
  }

  private mapProject(project: any): ProjectItem {
    return {
      id: String(project.id),
      name: project.name ?? project.title ?? '',
      description: project.description ?? '',
      status: project.status ?? 'ACTIVE',
      manager: project.owner?.user ? `${project.owner.user.firstname ?? ''} ${project.owner.user.lastname ?? ''}`.trim() : 'No manager',
      teamId: String(project.teamId ?? ''),
      teamName: project.teamName ?? '',
      teamSize: project.teamSize ?? 0,
      dueDate: project.endDate ?? '',
      startDate: project.startDate ?? '',
      progress: project.progress ?? (project.status === 'COMPLETED' ? 100 : 0)
    };
  }

  private createEmptyForm(): ProjectFormData {
    return {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      teamId: ''
    };
  }
}
