import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { extractData } from '../../core/utils/api-response';
import { ModalComponent } from '../../shared/components/modal/modal.component';

interface UserProfile {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  position: string;
  tasksCompleted: number;
  projectsAssigned: number;
  teamMember: string;
  joinDate: string;
  initials: string;
  twoFAEnabled: boolean;
  emailNotifications: boolean;
}

interface EditProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  pageTitle = 'My Profile';
  pageSubtitle = 'Manage your personal information';
  isAdmin = false;
  isEditModalOpen = false;
  isSavingProfile = false;
  editForm: EditProfileForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: ''
  };
  currentUser: UserProfile = {
    id: '',
    fullName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    position: '',
    tasksCompleted: 0,
    projectsAssigned: 0,
    teamMember: '',
    joinDate: '',
    initials: '',
    twoFAEnabled: false,
    emailNotifications: true
  };

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.pageTitle = this.isAdmin ? 'Admin Profile' : 'My Profile';
    this.pageSubtitle = this.isAdmin
      ? 'Manage your administrator account information'
      : 'Manage your personal information';
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.userService.getProfile().subscribe({
      next: response => {
        const user = extractData<any>(response);
        const firstName = user?.firstname ?? user?.firstName ?? '';
        const lastName = user?.lastname ?? user?.lastName ?? '';
        const fullName = `${firstName} ${lastName}`.trim();

        this.currentUser = {
          ...this.currentUser,
          id: String(user?.id ?? ''),
          fullName,
          firstName,
          lastName,
          email: user?.email ?? '',
          phone: user?.phone ?? '',
          role: user?.role ?? '',
          department: user?.department ?? '',
          position: user?.position ?? '',
          joinDate: user?.createdAt ?? '',
          initials: this.getInitials(fullName)
        };
      },
      error: error => alert(error.error?.message ?? 'Unable to load profile')
    });
  }

  onEditProfile(): void {
    this.editForm = {
      firstName: this.currentUser.firstName,
      lastName: this.currentUser.lastName,
      email: this.currentUser.email,
      phone: this.currentUser.phone,
      department: this.currentUser.department,
      position: this.currentUser.position
    };
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.isSavingProfile = false;
  }

  saveProfile(): void {
    const firstname = this.editForm.firstName.trim();
    const lastname = this.editForm.lastName.trim();
    const email = this.editForm.email.trim();

    if (!firstname || !lastname || !email || this.isSavingProfile) {
      return;
    }

    this.isSavingProfile = true;
    this.userService.updateProfile({
      firstname,
      lastname,
      email,
      phone: this.editForm.phone.trim(),
      department: this.editForm.department.trim(),
      position: this.editForm.position.trim()
    } as any).subscribe({
      next: () => {
        this.loadUserProfile();
        this.closeEditModal();
      },
      error: error => alert(error.error?.message ?? 'Unable to update profile')
    }).add(() => {
      this.isSavingProfile = false;
    });
  }

  onToggleSetting(settingName: string): void {
    if (settingName === 'twoFAEnabled') {
      this.currentUser.twoFAEnabled = !this.currentUser.twoFAEnabled;
    }
    if (settingName === 'emailNotifications') {
      this.currentUser.emailNotifications = !this.currentUser.emailNotifications;
    }
  }

  isProfileFormInvalid(): boolean {
    return (
      !this.editForm.firstName.trim()
      || !this.editForm.lastName.trim()
      || !this.editForm.email.trim()
      || this.isSavingProfile
    );
  }

  get isEditProfileInvalid(): boolean {
    return this.isProfileFormInvalid();
  }

  get joinDateLabel(): string {
    if (!this.currentUser.joinDate) {
      return '-';
    }

    const parsedDate = new Date(this.currentUser.joinDate);
    return Number.isNaN(parsedDate.getTime()) ? this.currentUser.joinDate : parsedDate.toLocaleDateString();
  }

  private getInitials(fullName: string): string {
    return fullName
      .split(' ')
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }
}
