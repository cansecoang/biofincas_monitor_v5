// RBAC (Role-Based Access Control) Configuration and Utilities

export enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  VIEWER = 'viewer'
}

export enum Permission {
  // Products
  CREATE_PRODUCT = 'create:product',
  READ_PRODUCT = 'read:product',
  UPDATE_PRODUCT = 'update:product',
  DELETE_PRODUCT = 'delete:product',
  
  // Tasks
  CREATE_TASK = 'create:task',
  READ_TASK = 'read:task',
  UPDATE_TASK = 'update:task',
  DELETE_TASK = 'delete:task',
  UPDATE_TASK_STATUS = 'update:task:status',
  
  // Indicators
  CREATE_INDICATOR = 'create:indicator',
  READ_INDICATOR = 'read:indicator',
  UPDATE_INDICATOR = 'update:indicator',
  DELETE_INDICATOR = 'delete:indicator',
  
  // Users
  CREATE_USER = 'create:user',
  READ_USER = 'read:user',
  UPDATE_USER = 'update:user',
  DELETE_USER = 'delete:user',
  MANAGE_ROLES = 'manage:roles',
  
  // Dashboard
  VIEW_DASHBOARD = 'view:dashboard',
  VIEW_ANALYTICS = 'view:analytics',
}

// Role-Permission mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    // Admin has all permissions
    ...Object.values(Permission)
  ],
  
  [Role.MANAGER]: [
    // Products
    Permission.CREATE_PRODUCT,
    Permission.READ_PRODUCT,
    Permission.UPDATE_PRODUCT,
    Permission.DELETE_PRODUCT,
    
    // Tasks
    Permission.CREATE_TASK,
    Permission.READ_TASK,
    Permission.UPDATE_TASK,
    Permission.DELETE_TASK,
    Permission.UPDATE_TASK_STATUS,
    
    // Indicators
    Permission.READ_INDICATOR,
    Permission.UPDATE_INDICATOR,
    
    // Users (limited)
    Permission.READ_USER,
    
    // Dashboard
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ANALYTICS,
  ],
  
  [Role.USER]: [
    // Products (read only, can update assigned ones)
    Permission.READ_PRODUCT,
    Permission.UPDATE_PRODUCT,
    
    // Tasks (can manage their assigned tasks)
    Permission.CREATE_TASK,
    Permission.READ_TASK,
    Permission.UPDATE_TASK,
    Permission.UPDATE_TASK_STATUS,
    
    // Indicators (read only)
    Permission.READ_INDICATOR,
    
    // Dashboard
    Permission.VIEW_DASHBOARD,
  ],
  
  [Role.VIEWER]: [
    // Read-only access
    Permission.READ_PRODUCT,
    Permission.READ_TASK,
    Permission.READ_INDICATOR,
    Permission.READ_USER,
    Permission.VIEW_DASHBOARD,
  ]
};

// Check if a role has a specific permission
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.includes(permission);
}

// Check if a role has any of the specified permissions
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

// Check if a role has all of the specified permissions
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

// User interface with role
export interface UserWithRole {
  user_id: number;
  user_name: string;
  user_email: string;
  role: Role;
}

// Session interface
export interface Session {
  user: UserWithRole;
  expiresAt: Date;
}
