import { useAuth } from '../contexts/AuthContext';

// All levels are now accessible without authentication
// Auth is only used for cloud sync and profile features
export function useLevelAccess() {
  const { isAuthenticated } = useAuth();

  const canAccessLevel = (level) => {
    // All levels accessible to everyone
    return true;
  };

  const requiresAuth = (level) => {
    return false;
  };

  return { canAccessLevel, requiresAuth, isAuthenticated };
}
