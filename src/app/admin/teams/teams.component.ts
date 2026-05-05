import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../core/services/team.service';
import { extractList } from '../../core/utils/api-response';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { AdminService } from '../../core/services/admin.service';

interface TeamMemberItem {
  id: string;
  employeeId: string;
  name: string;
}

interface TeamItem {
  id: string;
  name: string;
  description: string;
  leader: string;
  leaderId: string;
  memberCount: number;
  members: TeamMemberItem[];
}

interface TeamFormData {
  name: string;
  description: string;
  leaderId: string;
}

interface EmployeeOption {
  id: string;
  name: string;
}

type TeamLeaderFilter = 'ALL' | string;

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <div class="teams-container">
      <div class="section-header">
        <div class="header-content">
          <h1>Teams Management</h1>
          <p>Manage organization teams and members</p>
        </div>
        <button class="btn-primary" (click)="onCreateTeam()">+ Create Team</button>
      </div>

      <div class="filters-bar">
        <input
          type="text"
          placeholder="Search teams..."
          class="search-input"
          [(ngModel)]="searchTerm"
          (ngModelChange)="applyFilters()"
        />
        <select class="filter-select" [(ngModel)]="selectedLeaderId" (ngModelChange)="applyFilters()">
          <option value="ALL">All Leaders</option>
          <option *ngFor="let employee of employeeOptions" [value]="employee.id">{{ employee.name }}</option>
        </select>
      </div>

      <div class="teams-grid">
        <div class="team-card" *ngFor="let team of filteredTeams">
          <div class="team-header">
            <h3>{{ team.name }}</h3>
            <span class="member-count">{{ team.memberCount }} members</span>
          </div>
          <p class="team-description">{{ team.description }}</p>
          <div class="team-leader">
            <span class="label">Team Leader</span>
            <span class="value">{{ team.leader }}</span>
          </div>
          <div class="members-preview">
            <span class="members-label">Members</span>
            <div class="member-avatars">
              <div class="avatar" *ngFor="let member of team.members.slice(0, 5)" [title]="member.name">
                {{ member.name.charAt(0) }}
              </div>
              <div class="avatar more" *ngIf="team.memberCount > 5">
                +{{ team.memberCount - 5 }}
              </div>
            </div>
          </div>
          <div class="card-actions">
            <button class="action-btn view" title="View Team" (click)="onViewTeam(team.id)">View</button>
            <button class="action-btn edit" title="Edit" (click)="onEditTeam(team.id)">Edit</button>
            <button class="action-btn delete" title="Delete" (click)="onDeleteTeam(team.id)">Delete</button>
          </div>
        </div>
        <p *ngIf="filteredTeams.length === 0">No teams found.</p>
      </div>
    </div>

    <app-modal
      [isOpen]="isCreateModalOpen"
      [title]="'Create Team'"
      [confirmText]="'Create Team'"
      [cancelText]="'Cancel'"
      [isConfirmDisabled]="!teamForm.name"
      (confirm)="submitCreateTeam()"
      (close)="closeCreateModal()"
    >
      <div class="team-form">
        <div class="form-row">
          <label for="teamName">Team Name</label>
          <input id="teamName" type="text" [(ngModel)]="teamForm.name" name="teamName" />
        </div>

        <div class="form-row">
          <label for="teamDescription">Description</label>
          <textarea id="teamDescription" rows="4" [(ngModel)]="teamForm.description" name="teamDescription"></textarea>
        </div>

        <div class="form-row">
          <label for="leaderId">Leader Employee</label>
          <select id="leaderId" [(ngModel)]="teamForm.leaderId" name="leaderId">
            <option value="">No leader</option>
            <option *ngFor="let employee of employeeOptions" [value]="employee.id">{{ employee.name }}</option>
          </select>
        </div>

        <p class="form-error" *ngIf="formError">{{ formError }}</p>
      </div>
    </app-modal>

    <app-modal
      [isOpen]="isViewModalOpen"
      [title]="selectedTeam ? selectedTeam.name : 'Team Details'"
      [confirmText]="'Close'"
      [cancelText]="'Cancel'"
      [showCancelButton]="false"
      (confirm)="closeViewModal()"
      (close)="closeViewModal()"
    >
      <div class="team-form" *ngIf="selectedTeam">
        <div class="details-block">
          <p><strong>Description:</strong> {{ selectedTeam.description || 'No description' }}</p>
          <p><strong>Leader:</strong> {{ selectedTeam.leader }}</p>
          <p><strong>Members:</strong> {{ selectedTeam.memberCount }}</p>
        </div>

        <div class="form-row">
          <label for="employeeToAdd">Add Employee To Team</label>
          <div class="member-actions-row">
            <select id="employeeToAdd" [(ngModel)]="selectedEmployeeId" name="employeeToAdd">
              <option value="">Select an employee</option>
              <option *ngFor="let employee of availableEmployeesForSelectedTeam()" [value]="employee.id">{{ employee.name }}</option>
            </select>
            <button type="button" class="btn-primary small-btn" (click)="addEmployeeToSelectedTeam()">Add</button>
          </div>
        </div>

        <div class="members-list" *ngIf="selectedTeam.members.length > 0">
          <div class="member-row" *ngFor="let member of selectedTeam.members">
            <span>{{ member.name }}</span>
            <button type="button" class="remove-member-btn" (click)="removeEmployeeFromSelectedTeam(member.employeeId)">Remove</button>
          </div>
        </div>

        <p class="form-error" *ngIf="formError">{{ formError }}</p>
      </div>
    </app-modal>

    <app-modal
      [isOpen]="isEditModalOpen"
      [title]="'Edit Team'"
      [confirmText]="'Save Changes'"
      [cancelText]="'Cancel'"
      [isConfirmDisabled]="!teamForm.name"
      (confirm)="submitEditTeam()"
      (close)="closeEditModal()"
    >
      <div class="team-form">
        <div class="form-row">
          <label for="editTeamName">Team Name</label>
          <input id="editTeamName" type="text" [(ngModel)]="teamForm.name" name="editTeamName" />
        </div>

        <div class="form-row">
          <label for="editTeamDescription">Description</label>
          <textarea id="editTeamDescription" rows="4" [(ngModel)]="teamForm.description" name="editTeamDescription"></textarea>
        </div>

        <div class="form-row">
          <label for="editLeaderId">Leader Employee</label>
          <select id="editLeaderId" [(ngModel)]="teamForm.leaderId" name="editLeaderId">
            <option value="">No leader</option>
            <option *ngFor="let employee of employeeOptions" [value]="employee.id">{{ employee.name }}</option>
          </select>
        </div>

        <p class="form-error" *ngIf="formError">{{ formError }}</p>
      </div>
    </app-modal>

    <app-modal
      [isOpen]="isDeleteModalOpen"
      [title]="'Delete Team'"
      [confirmText]="'Delete'"
      [cancelText]="'Cancel'"
      (confirm)="confirmDeleteTeam()"
      (close)="closeDeleteModal()"
    >
      <div class="team-form" *ngIf="selectedTeam">
        <p class="delete-copy">Are you sure you want to delete <strong>{{ selectedTeam.name }}</strong>?</p>
        <p class="form-error" *ngIf="deleteError">{{ deleteError }}</p>
      </div>
    </app-modal>
  `,
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {
  teams: TeamItem[] = [];
  filteredTeams: TeamItem[] = [];
  employeeOptions: EmployeeOption[] = [];
  searchTerm = '';
  selectedLeaderId: TeamLeaderFilter = 'ALL';

  isCreateModalOpen = false;
  isViewModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;

  selectedTeam: TeamItem | null = null;
  selectedEmployeeId = '';
  teamForm: TeamFormData = this.createEmptyForm();
  formError = '';
  deleteError = '';

  constructor(
    private teamService: TeamService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadTeams();
    this.loadEmployees();
  }

  loadTeams(): void {
    this.teamService.getAllTeams(0, 100).subscribe({
      next: response => {
        this.teams = extractList<any>(response).map(team => {
          const members = (team.members ?? []).map((member: any) => ({
            id: String(member.id ?? ''),
            employeeId: String(member.employee?.id ?? ''),
            name: this.employeeName(member.employee)
          }));

          return {
            id: String(team.id),
            name: team.name ?? '',
            description: team.description ?? '',
            leader: this.employeeName(team.leader) || 'No leader',
            leaderId: String(team.leader?.id ?? ''),
            memberCount: team.memberCount ?? members.length,
            members
          };
        });
        this.applyFilters();
      },
      error: error => alert(error.error?.message ?? 'Unable to load teams')
    });
  }

  loadEmployees(): void {
    this.adminService.getAllEmployees().subscribe({
      next: response => {
        this.employeeOptions = extractList<any>(response).map(employee => ({
          id: String(employee.id ?? ''),
          name: `${employee.user?.firstname ?? employee.user?.firstName ?? ''} ${employee.user?.lastname ?? employee.user?.lastName ?? ''}`.trim()
        })).filter((employee: EmployeeOption) => !!employee.id && !!employee.name);
      },
      error: () => {
        this.employeeOptions = [];
        this.applyFilters();
      }
    });
  }

  applyFilters(): void {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();

    this.filteredTeams = this.teams.filter(team => {
      const matchesSearch = !normalizedSearch
        || team.name.toLowerCase().includes(normalizedSearch)
        || team.description.toLowerCase().includes(normalizedSearch)
        || team.leader.toLowerCase().includes(normalizedSearch);

      const matchesLeader = this.selectedLeaderId === 'ALL' || team.leaderId === this.selectedLeaderId;

      return matchesSearch && matchesLeader;
    });
  }

  onCreateTeam(): void {
    this.teamForm = this.createEmptyForm();
    this.formError = '';
    this.isCreateModalOpen = true;
  }

  onViewTeam(teamId: string): void {
    const team = this.teams.find(item => item.id === teamId);
    if (!team) return;

    this.selectedTeam = team;
    this.selectedEmployeeId = '';
    this.formError = '';
    this.isViewModalOpen = true;
  }

  onEditTeam(teamId: string): void {
    const team = this.teams.find(item => item.id === teamId);
    if (!team) return;

    this.selectedTeam = team;
    this.teamForm = {
      name: team.name,
      description: team.description,
      leaderId: team.leaderId
    };
    this.formError = '';
    this.isEditModalOpen = true;
  }

  onDeleteTeam(teamId: string): void {
    const team = this.teams.find(item => item.id === teamId);
    if (!team) return;

    this.selectedTeam = team;
    this.deleteError = '';
    this.isDeleteModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
    this.formError = '';
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.formError = '';
    this.selectedEmployeeId = '';
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.formError = '';
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.deleteError = '';
  }

  submitCreateTeam(): void {
    this.formError = '';

    if (!this.teamForm.name.trim()) {
      this.formError = 'Team name is required.';
      return;
    }

    this.teamService.createTeam(this.buildTeamPayload()).subscribe({
      next: () => {
        this.closeCreateModal();
        this.loadTeams();
      },
      error: error => {
        this.formError = error.error?.message ?? 'Unable to create team';
      }
    });
  }

  submitEditTeam(): void {
    if (!this.selectedTeam) return;

    this.formError = '';
    if (!this.teamForm.name.trim()) {
      this.formError = 'Team name is required.';
      return;
    }

    this.teamService.updateTeam(Number(this.selectedTeam.id), this.buildTeamPayload()).subscribe({
      next: () => {
        this.closeEditModal();
        this.loadTeams();
      },
      error: error => {
        this.formError = error.error?.message ?? 'Unable to update team';
      }
    });
  }

  confirmDeleteTeam(): void {
    if (!this.selectedTeam) return;

    this.deleteError = '';
    this.teamService.deleteTeam(Number(this.selectedTeam.id)).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadTeams();
      },
      error: error => {
        this.deleteError = error.error?.message ?? 'Unable to delete team';
      }
    });
  }

  addEmployeeToSelectedTeam(): void {
    if (!this.selectedTeam || !this.selectedEmployeeId) {
      this.formError = 'Select an employee first.';
      return;
    }

    this.formError = '';
    this.teamService.addMemberToTeam(Number(this.selectedTeam.id), Number(this.selectedEmployeeId)).subscribe({
      next: () => {
        this.selectedEmployeeId = '';
        this.reloadSelectedTeam(this.selectedTeam!.id);
      },
      error: error => {
        this.formError = error.error?.message ?? 'Unable to add employee to team';
      }
    });
  }

  removeEmployeeFromSelectedTeam(employeeId: string): void {
    if (!this.selectedTeam) return;

    this.formError = '';
    this.teamService.removeMemberFromTeam(Number(this.selectedTeam.id), Number(employeeId)).subscribe({
      next: () => this.reloadSelectedTeam(this.selectedTeam!.id),
      error: error => {
        this.formError = error.error?.message ?? 'Unable to remove employee from team';
      }
    });
  }

  availableEmployeesForSelectedTeam(): EmployeeOption[] {
    const currentMembers = new Set((this.selectedTeam?.members ?? []).map(member => member.employeeId));
    return this.employeeOptions.filter(employee => !currentMembers.has(employee.id));
  }

  private reloadSelectedTeam(teamId: string): void {
    this.teamService.getTeamById(Number(teamId)).subscribe({
      next: response => {
        const rawTeam = (response as any).data ?? response;
        const updatedTeam = this.mapTeam(rawTeam);
        this.selectedTeam = updatedTeam;
        this.teams = this.teams.map(team => team.id === teamId ? updatedTeam : team);
      },
      error: error => {
        this.formError = error.error?.message ?? 'Unable to reload team';
      }
    });
  }

  private buildTeamPayload(): { name: string; description?: string; leaderId?: number } {
    const leaderId = Number(this.teamForm.leaderId);
    return {
      name: this.teamForm.name.trim(),
      description: this.teamForm.description.trim(),
      leaderId: Number.isFinite(leaderId) && leaderId > 0 ? leaderId : undefined
    };
  }

  private mapTeam(team: any): TeamItem {
    const members = (team.members ?? []).map((member: any) => ({
      id: String(member.id ?? ''),
      employeeId: String(member.employee?.id ?? ''),
      name: this.employeeName(member.employee)
    }));

    return {
      id: String(team.id),
      name: team.name ?? '',
      description: team.description ?? '',
      leader: this.employeeName(team.leader) || 'No leader',
      leaderId: String(team.leader?.id ?? ''),
      memberCount: team.memberCount ?? members.length,
      members
    };
  }

  private employeeName(employee: any): string {
    if (!employee?.user) return '';
    return `${employee.user.firstname ?? employee.user.firstName ?? ''} ${employee.user.lastname ?? employee.user.lastName ?? ''}`.trim();
  }

  private createEmptyForm(): TeamFormData {
    return {
      name: '',
      description: '',
      leaderId: ''
    };
  }
}
