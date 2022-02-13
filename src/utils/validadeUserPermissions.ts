interface User {
  permissions: string[];
  roles: string[];
}

interface ValidadeUserPermissionjsParams {
  user: User;
  permissions?: string[];
  roles?: string[];
}

export function validateUserPermissions({
  user,
  permissions,
  roles,
}: ValidadeUserPermissionjsParams) {
  if (permissions?.length > 0) {
    const hasPermissions = permissions.every((permission) => {
      return user.permissions.includes(permission);
    });
    if (!hasPermissions) {
      return false;
    }
  }
  if (roles?.length > 0) {
    const hasRoles = roles.some((role) => {
      return user.roles.includes(role);
    });
    if (!hasRoles) {
      return false;
    }
  }
  return true;
}
