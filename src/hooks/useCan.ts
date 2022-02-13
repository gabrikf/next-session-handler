import { validateUserPermissions } from "../utils/validadeUserPermissions";
import { useSession } from "./AuthContext";

interface UseCanParams {
  permissions?: string[];
  roles?: string[];
}

export function useCan({ permissions, roles }: UseCanParams) {
  const { isAuthenticated, user } = useSession();
  if (!isAuthenticated) {
    return false;
  }
  const userCanUse = validateUserPermissions({ user, permissions, roles });

  return userCanUse;
}
