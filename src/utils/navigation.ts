// Simple client-side routing utility
export const navigateToRoute = (path: string) => {
  window.history.pushState({}, '', path);
  // Trigger a custom event to notify components of route change
  window.dispatchEvent(new PopStateEvent('popstate'));
};

// Get current route
export const getCurrentRoute = () => {
  return window.location.pathname;
};

// Route mapping
export const ROUTES = {
  HOME: '/',
  CONTACT: '/contact',
  ADMIN: '/admin',
  SUPER_ADMIN: '/super-admin',
} as const; 