import { useAuth } from "../contexts/AuthContext";

export function usePermissions() {
  const { userData } = useAuth();

  const isAdmin = userData?.isAdmin ?? false;

  const canAccessIgreja = (igrejaId: string) => {
    if (isAdmin) return true;
    return userData?.igreja === igrejaId;
  };

  const canAccessCargo = (cargoId: string) => {
    if (isAdmin) return true;
    return userData?.cargo === cargoId;
  };

  const canManageUsers = () => {
    return isAdmin;
  };

  return {
    isAdmin,
    canAccessIgreja,
    canAccessCargo,
    canManageUsers,
  };
}
