import { useAuth } from "../contexts/AuthContext";

export function usePermissions() {
  const { user } = useAuth();

  const isAdmin = user?.isAdmin ?? false;

  const canAccessIgreja = (igrejaId: string) => {
    if (isAdmin) return true;
    return user?.igreja === igrejaId;
  };

  const canAccessCargo = (cargoId: string) => {
    if (isAdmin) return true;
    return user?.cargo === cargoId;
  };

  const canManageUsers = () => {
    return isAdmin;
  };

  const canManageIgrejas = () => {
    return isAdmin;
  };

  return {
    isAdmin,
    canAccessIgreja,
    canAccessCargo,
    canManageUsers,
    canManageIgrejas,
  };
}
