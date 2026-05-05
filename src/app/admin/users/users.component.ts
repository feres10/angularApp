import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { AdminService } from '../../core/services/admin.service';
import { extractList } from '../../core/utils/api-response';
import { ModalComponent } from '../../shared/components/modal/modal.component';

interface UserItem {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

interface PendingUserItem {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  createdAt: string;
}

type ModalAction = 'info' | 'approve' | 'reject' | 'delete' | 'edit';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: UserItem[] = [];
  filteredUsers: UserItem[] = [];
  pendingUsers: PendingUserItem[] = [];
  searchTerm = '';
  selectedRole = 'ALL';
  selectedStatus = 'ALL';

  isModalOpen = false;
  modalTitle = '';
  modalMessage = '';
  modalConfirmText = 'Confirm';
  modalAction: ModalAction = 'info';
  selectedUserId: string | null = null;
  selectedPendingUserId: string | null = null;

  editForm = {
    firstname: '',
    lastname: '',
    role: 'EMPLOYEE',
    status: 'PENDING'
  };

  constructor(
    private userService: UserService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadPendingUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers(0, 100).subscribe({
      next: response => {
        this.users = extractList<any>(response).map(user => ({
          id: String(user.id),
          fullName: `${user.firstname ?? user.firstName ?? ''} ${user.lastname ?? user.lastName ?? ''}`.trim(),
          email: user.email ?? '',
          role: user.role ?? '',
          status: user.status ?? '',
          createdAt: user.createdAt ?? ''
        }));
        this.applyFilters();
      },
      error: error => {
        this.openInfoModal(error.error?.message ?? 'Unable to load users');
      }
    });
  }

  applyFilters(): void {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();

    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !normalizedSearch
        || user.fullName.toLowerCase().includes(normalizedSearch)
        || user.email.toLowerCase().includes(normalizedSearch);

      const matchesRole = this.selectedRole === 'ALL' || user.role === this.selectedRole;
      const matchesStatus = this.selectedStatus === 'ALL' || user.status === this.selectedStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  loadPendingUsers(): void {
    this.adminService.getPendingRequests().subscribe({
      next: response => {
        this.pendingUsers = extractList<any>(response)
          .map(employee => ({
            id: String(employee.user?.id ?? ''),
            employeeId: String(employee.id ?? ''),
            fullName: `${employee.user?.firstname ?? employee.user?.firstName ?? ''} ${employee.user?.lastname ?? employee.user?.lastName ?? ''}`.trim(),
            email: employee.user?.email ?? '',
            createdAt: employee.user?.createdAt ?? ''
          }))
          .filter(user => user.id);
      },
      error: error => {
        this.openInfoModal(error.error?.message ?? 'Unable to load pending requests');
      }
    });
  }

  onAddUser(): void {
    this.openInfoModal('Les nouveaux comptes employés doivent passer par Register, puis être validés par l\'admin ici.');
  }

  onEditUser(userId: string): void {
    const user = this.users.find(item => item.id === userId);
    if (!user) return;

    const [firstname, ...lastnameParts] = user.fullName.split(' ');
    this.editForm = {
      firstname: firstname ?? '',
      lastname: lastnameParts.join(' '),
      role: user.role || 'EMPLOYEE',
      status: user.status || 'PENDING'
    };

    this.selectedUserId = userId;
    this.modalAction = 'edit';
    this.modalTitle = 'Edit User';
    this.modalMessage = '';
    this.modalConfirmText = 'Save';
    this.isModalOpen = true;
  }

  onDeleteUser(userId: string): void {
    this.selectedUserId = userId;
    this.modalAction = 'delete';
    this.modalTitle = 'Delete User';
    this.modalMessage = 'Do you want to delete this user?';
    this.modalConfirmText = 'Delete';
    this.isModalOpen = true;
  }

  onApproveUser(userId: string): void {
    this.selectedPendingUserId = userId;
    this.modalAction = 'approve';
    this.modalTitle = 'Approve Registration';
    this.modalMessage = 'Do you want to approve this registration request?';
    this.modalConfirmText = 'Approve';
    this.isModalOpen = true;
  }

  onRejectUser(userId: string): void {
    this.selectedPendingUserId = userId;
    this.modalAction = 'reject';
    this.modalTitle = 'Reject Registration';
    this.modalMessage = 'Do you want to reject this registration request?';
    this.modalConfirmText = 'Reject';
    this.isModalOpen = true;
  }

  onModalConfirm(): void {
    if (this.modalAction === 'info') {
      this.closeModal();
      return;
    }

    if (this.modalAction === 'edit' && this.selectedUserId) {
      this.userService.updateUser(Number(this.selectedUserId), {
        firstname: this.editForm.firstname,
        lastname: this.editForm.lastname,
        role: this.editForm.role,
        status: this.editForm.status
      } as any).subscribe({
        next: () => {
          this.closeModal();
          this.loadUsers();
          this.loadPendingUsers();
        },
        error: error => {
          this.openInfoModal(error.error?.message ?? 'Unable to update user');
        }
      });
      return;
    }

    if (this.modalAction === 'delete' && this.selectedUserId) {
      this.userService.deleteUser(Number(this.selectedUserId)).subscribe({
        next: () => {
          this.closeModal();
          this.loadUsers();
          this.loadPendingUsers();
        },
        error: error => {
          this.openInfoModal(error.error?.message ?? 'Unable to delete user');
        }
      });
      return;
    }

    if (this.modalAction === 'approve' && this.selectedPendingUserId) {
      this.adminService.approveUser(Number(this.selectedPendingUserId)).subscribe({
        next: () => {
          this.closeModal();
          this.loadUsers();
          this.loadPendingUsers();
        },
        error: error => {
          this.openInfoModal(error.error?.message ?? 'Unable to approve user');
        }
      });
      return;
    }

    if (this.modalAction === 'reject' && this.selectedPendingUserId) {
      this.adminService.rejectUser(Number(this.selectedPendingUserId)).subscribe({
        next: () => {
          this.closeModal();
          this.loadUsers();
          this.loadPendingUsers();
        },
        error: error => {
          this.openInfoModal(error.error?.message ?? 'Unable to reject user');
        }
      });
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedUserId = null;
    this.selectedPendingUserId = null;
    this.modalAction = 'info';
  }

  private openInfoModal(message: string): void {
    this.modalAction = 'info';
    this.modalTitle = 'Information';
    this.modalMessage = message;
    this.modalConfirmText = 'OK';
    this.isModalOpen = true;
  }
}
