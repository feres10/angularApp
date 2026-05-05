export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  employeeType?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  email: string;
  firstname: string;
  lastname: string;
  role: string;
  status: string;
  message: string;
}

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
  employeeType?: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Employee {
  id: number;
  user: User;
  category: Category;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: any;
}
