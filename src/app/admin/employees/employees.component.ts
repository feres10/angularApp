import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { extractList } from '../../core/utils/api-response';
import { ModalComponent } from '../../shared/components/modal/modal.component';

interface EmployeeItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  employeeType: string;
}

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  department: string;
  employeeType: string;
}

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <div class="employees-container">
      <div class="section-header">
        <div class="header-content">
          <h1>Employees Management</h1>
          <p>Manage all employees in your organization</p>
        </div>
        <button class="btn-primary" (click)="onAddEmployee()">+ Add Employee</button>
      </div>

      <div class="filters-bar">
        <input
          type="text"
          placeholder="Search by name or email..."
          class="search-input"
          [(ngModel)]="searchTerm"
          (ngModelChange)="applyFilters()"
        />
        <select class="filter-select" [(ngModel)]="selectedDepartment" (ngModelChange)="applyFilters()">
          <option value="ALL">All Departments</option>
          <option *ngFor="let department of departmentOptions" [value]="department">{{ department }}</option>
        </select>
        <select class="filter-select" [(ngModel)]="selectedEmployeeType" (ngModelChange)="applyFilters()">
          <option value="ALL">All Types</option>
          <option *ngFor="let type of employeeTypeOptions" [value]="type.value">{{ type.label }}</option>
        </select>
      </div>

      <div class="table-wrapper">
        <table class="employees-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Email</th>
              <th>Department</th>
              <th>Position</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let employee of filteredEmployees">
              <td>{{ employee.firstName }} {{ employee.lastName }}</td>
              <td>{{ employee.email }}</td>
              <td>{{ employee.department }}</td>
              <td>{{ employee.position }}</td>
              <td>{{ employee.phone || '-' }}</td>
              <td>
                <button class="action-btn edit" title="Edit" (click)="onEditEmployee(employee.id)">Edit</button>
                <button class="action-btn delete" title="Delete" (click)="onDeleteEmployee(employee.id)">Delete</button>
              </td>
            </tr>
            <tr *ngIf="filteredEmployees.length === 0">
              <td colspan="6">No employees found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <button class="btn-secondary">Previous</button>
        <span class="page-info">Page 1 of 10</span>
        <button class="btn-secondary">Next</button>
      </div>
    </div>

    <app-modal
      [isOpen]="isEmployeeModalOpen"
      [title]="isEditMode ? 'Edit Employee' : 'Add Employee'"
      [confirmText]="isEditMode ? 'Save Changes' : 'Create Employee'"
      [cancelText]="'Cancel'"
      [isConfirmDisabled]="isSubmitDisabled()"
      (confirm)="submitEmployeeForm()"
      (close)="closeEmployeeModal()"
    >
      <div class="employee-form">
        <div class="form-grid">
          <div class="form-row">
            <label for="firstName">First Name</label>
            <input id="firstName" type="text" [(ngModel)]="employeeForm.firstName" name="firstName" />
          </div>

          <div class="form-row">
            <label for="lastName">Last Name</label>
            <input id="lastName" type="text" [(ngModel)]="employeeForm.lastName" name="lastName" />
          </div>

          <div class="form-row">
            <label for="email">Email</label>
            <input id="email" type="email" [(ngModel)]="employeeForm.email" name="email" />
          </div>

          <div class="form-row">
            <label for="phone">Phone</label>
            <input id="phone" type="text" [(ngModel)]="employeeForm.phone" name="phone" placeholder="Enter phone number" />
          </div>

          <div class="form-row" *ngIf="!isEditMode">
            <label for="password">Password</label>
            <input id="password" type="password" [(ngModel)]="employeeForm.password" name="password" />
          </div>

          <div class="form-row">
            <label for="department">Department</label>
            <select id="department" [(ngModel)]="employeeForm.department" name="department">
              <option value="" disabled>Select a department</option>
              <option *ngFor="let department of departmentOptions" [value]="department">{{ department }}</option>
            </select>
          </div>

          <div class="form-row form-row-wide">
            <label for="employeeType">Employee Type</label>
            <select id="employeeType" [(ngModel)]="employeeForm.employeeType" name="employeeType">
              <option *ngFor="let type of employeeTypeOptions" [value]="type.value">{{ type.label }}</option>
            </select>
          </div>
        </div>

        <p class="form-error" *ngIf="formError">{{ formError }}</p>
      </div>
    </app-modal>
  `,
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {
  readonly departmentOptions = ['DEVOPS', 'IA', 'RH', 'FINANCE', 'DEVELOPPEMENT'];
  readonly employeeTypeOptions = [
    { value: 'DEVELOPER', label: 'Developer' },
    { value: 'DEVOPS_ENGINEER', label: 'DevOps Engineer' },
    { value: 'DATA_SCIENTIST', label: 'Data Scientist' },
    { value: 'HR_SPECIALIST', label: 'HR Specialist' },
    { value: 'FINANCE_SPECIALIST', label: 'Finance Specialist' },
    { value: 'MANAGER', label: 'Manager' },
    { value: 'ANALYST', label: 'Analyst' },
    { value: 'OTHER', label: 'Other' }
  ];

  employees: EmployeeItem[] = [];
  filteredEmployees: EmployeeItem[] = [];
  searchTerm = '';
  selectedDepartment = 'ALL';
  selectedEmployeeType = 'ALL';
  isEmployeeModalOpen = false;
  isEditMode = false;
  selectedEmployeeId: string | null = null;
  formError = '';
  employeeForm: EmployeeFormData = this.createEmptyForm();

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.adminService.getAllEmployees().subscribe({
      next: response => {
        this.employees = extractList<any>(response).map(employee => ({
          id: String(employee.id),
          firstName: employee.user?.firstname ?? employee.user?.firstName ?? '',
          lastName: employee.user?.lastname ?? employee.user?.lastName ?? '',
          email: employee.user?.email ?? '',
          phone: employee.phone ?? '',
          position: this.formatEmployeeType(employee.employeeType ?? employee.position ?? 'DEVELOPER'),
          department: employee.department ?? employee.category?.name ?? '',
          employeeType: employee.employeeType ?? 'DEVELOPER'
        }));
        this.applyFilters();
      },
      error: error => alert(error.error?.message ?? 'Unable to load employees')
    });
  }

  applyFilters(): void {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();

    this.filteredEmployees = this.employees.filter(employee => {
      const fullName = `${employee.firstName} ${employee.lastName}`.trim().toLowerCase();
      const matchesSearch = !normalizedSearch
        || fullName.includes(normalizedSearch)
        || employee.email.toLowerCase().includes(normalizedSearch)
        || employee.position.toLowerCase().includes(normalizedSearch);

      const matchesDepartment = this.selectedDepartment === 'ALL'
        || employee.department.toUpperCase() === this.selectedDepartment;
      const matchesEmployeeType = this.selectedEmployeeType === 'ALL'
        || employee.employeeType.toUpperCase() === this.selectedEmployeeType;

      return matchesSearch && matchesDepartment && matchesEmployeeType;
    });
  }

  onAddEmployee(): void {
    this.isEditMode = false;
    this.selectedEmployeeId = null;
    this.formError = '';
    this.employeeForm = this.createEmptyForm();
    this.isEmployeeModalOpen = true;
  }

  onEditEmployee(employeeId: string): void {
    const employee = this.employees.find(item => item.id === employeeId);
    if (!employee) return;

    this.isEditMode = true;
    this.selectedEmployeeId = employeeId;
    this.formError = '';
    this.employeeForm = {
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      password: '',
      phone: employee.phone,
      department: this.normalizeDepartment(employee.department),
      employeeType: this.normalizeEmployeeType(employee.employeeType)
    };
    this.isEmployeeModalOpen = true;
  }

  onDeleteEmployee(employeeId: string): void {
    if (!confirm('Delete this employee?')) return;

    this.adminService.deleteEmployee(Number(employeeId)).subscribe({
      next: () => this.loadEmployees(),
      error: error => alert(error.error?.message ?? 'Unable to delete employee')
    });
  }

  closeEmployeeModal(): void {
    this.isEmployeeModalOpen = false;
    this.formError = '';
  }

  isSubmitDisabled(): boolean {
    return !this.employeeForm.firstName.trim()
      || !this.employeeForm.lastName.trim()
      || !this.employeeForm.email.trim()
      || !this.employeeForm.department.trim()
      || !this.employeeForm.employeeType.trim()
      || (!this.isEditMode && !this.employeeForm.password.trim());
  }

  submitEmployeeForm(): void {
    this.formError = '';

    if (this.isSubmitDisabled()) {
      this.formError = 'Please fill in all required fields.';
      return;
    }

    const payload = {
      firstname: this.employeeForm.firstName.trim(),
      lastname: this.employeeForm.lastName.trim(),
      email: this.employeeForm.email.trim(),
      password: this.employeeForm.password.trim() || undefined,
      phone: this.employeeForm.phone.trim(),
      department: this.employeeForm.department.trim(),
      employeeType: this.employeeForm.employeeType
    };

    const request = this.isEditMode && this.selectedEmployeeId
      ? this.adminService.updateEmployee(Number(this.selectedEmployeeId), payload)
      : this.adminService.createEmployee(payload);

    request.subscribe({
      next: () => {
        this.closeEmployeeModal();
        this.loadEmployees();
      },
      error: error => {
        this.formError = error.error?.message ?? (this.isEditMode ? 'Unable to update employee' : 'Unable to create employee');
      }
    });
  }

  private createEmptyForm(): EmployeeFormData {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      department: '',
      employeeType: 'DEVELOPER'
    };
  }

  private normalizeDepartment(value: string): string {
    const normalized = value?.trim().toUpperCase() ?? '';
    return this.departmentOptions.includes(normalized) ? normalized : '';
  }

  private normalizeEmployeeType(value: string): string {
    const normalized = value?.trim().toUpperCase() ?? '';
    return this.employeeTypeOptions.some(type => type.value === normalized) ? normalized : 'OTHER';
  }

  private formatEmployeeType(value: string): string {
    const option = this.employeeTypeOptions.find(type => type.value === value);
    if (option) {
      return option.label;
    }

    return value.replace(/_/g, ' ');
  }
}
