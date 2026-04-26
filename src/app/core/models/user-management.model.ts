export interface Role {
  id?: number;
  name: string;
}

export interface ManagedUser {
  id?: number;
  roleId: number;
  fullName: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  createdAt?: string;
  password?: string;
  role?: Role;
}
