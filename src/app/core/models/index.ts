// Authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// User & Employee
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED'
}

export interface Employee {
  id: number;
  user: User;
  phone?: string;
  address?: string;
  department?: string;
  position?: string;
  salary?: number;
  hireDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Projects
export interface Project {
  id: number;
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  status: ProjectStatus;
  budget?: number;
  progress: number;
  category?: Category;
  owner?: Employee;
  createdAt: Date;
  updatedAt: Date;
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
  CANCELLED = 'CANCELLED'
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tasks
export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: Date;
  startDate?: Date;
  assignedEmployee?: Employee;
  project: Project;
  team?: Team;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Teams
export interface Team {
  id: number;
  name: string;
  description?: string;
  leader?: Employee;
  members?: TeamMember[];
  projects?: Project[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: number;
  employee: Employee;
  team: Team;
  joinedAt: Date;
}

// Assignments
export interface Assignment {
  id: number;
  employee: Employee;
  project: Project;
  role?: string;
  assignedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Chat & Messages
export interface Message {
  id: number;
  content: string;
  sender: User;
  team: Team;
  messageType: MessageType;
  attachments?: string[];
  timestamp: Date;
}

export enum MessageType {
  CHAT = 'CHAT',
  JOIN = 'JOIN',
  LEAVE = 'LEAVE',
  ANNOUNCEMENT = 'ANNOUNCEMENT'
}

export interface ChatMessage {
  content: string;
  teamId: number;
}

// Notifications
export interface Notification {
  id: number;
  title: string;
  content: string;
  isRead: boolean;
  user: User;
  notificationType?: NotificationType;
  relatedEntityId?: number;
  createdAt: Date;
}

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  TASK_OVERDUE = 'TASK_OVERDUE',
  TASK_URGENT = 'TASK_URGENT',
  MESSAGE_NEW = 'MESSAGE_NEW',
  TEAM_ADDED = 'TEAM_ADDED',
  TEAM_REMOVED = 'TEAM_REMOVED',
  TEAM_MEMBER_JOINED = 'TEAM_MEMBER_JOINED',
  PROJECT_UPDATED = 'PROJECT_UPDATED',
  ADMIN_NOTICE = 'ADMIN_NOTICE'
}

// API Responses
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  timestamp?: Date;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// Dashboard Stats
export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  urgentTasks: number;
  overdueTasks: number;
  totalTeams: number;
  activeEmployees: number;
  totalProjects: number;
  activeProjects: number;
}

export interface TaskStats {
  byPriority: Record<TaskPriority, number>;
  byStatus: Record<TaskStatus, number>;
  completionRate: number;
  avgCompletionTime: number;
}

// Chart Data
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string[];
  borderColor?: string[];
  fill?: boolean;
}

// Activity Log
export interface ActivityLog {
  id: number;
  user: User;
  action: string;
  entityType: string;
  entityId: number;
  description?: string;
  timestamp: Date;
}

// Settings
export interface AppSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  soundEnabled: boolean;
  emailNotifications: boolean;
}
