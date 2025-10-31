// Common types for the application
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: User;
}

export interface AuthRequest {
  action: 'signup' | 'login' | 'logout' | 'reset-password' | 'update-profile';
  email?: string;
  password?: string;
  full_name?: string;
  redirectTo?: string;
  userId?: string;
  updates?: {
    email?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface AuthResponse {
  user?: User;
  session?: Session;
  error?: string;
  message?: string;
}
