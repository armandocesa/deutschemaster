import { useAuth } from '../contexts/AuthContext';

// Levels that require authentication (A2 and above)
const RESTRICTED_LEVELS = ['A2', 'B1', 'B2', 'C1', 'C2'];

export function useLevelAccess() {
  const { isAuthenticated } = useAuth();

  const canAccessLevel = (level) => {
    if (!level) return true;
    // A1 is always accessible
    if (level === 'A1') return true;
    // All other levels require authentication
    return isAuthenticated;
  };

  const requiresAuth = (level) => {
    if (!level) return false;
    return RESTRICTED_LEVELS.includes(level);
  };

  return { canAccessLevel, requiresAuth, isAuthenticated };
}
