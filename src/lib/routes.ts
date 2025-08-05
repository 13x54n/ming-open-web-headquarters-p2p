// Route configuration for the application
export const ROUTES = {
  // Public routes (accessible to everyone)
  PUBLIC: {
    HOME: '/',
    PRIVACY: '/privacy',
    TERMS: '/terms',
    LOGIN: '/login',
  },

  // Private routes (require authentication)
  PRIVATE: {
    DASHBOARD: '/dashboard',
    WALLET: '/wallet',
    SETTINGS: '/settings',
    TRADING: '/trading',
    ORDERS: '/orders',
    TRANSACTIONS: '/transactions',
    NOTIFICATIONS: '/notifications',
  },

  // API routes
  API: {
    AUTH: '/api/auth',
    USER: '/api/user',
    TRADING: '/api/trading',
    WALLET: '/api/wallet',
  }
} as const;

// Navigation menu configuration
export const NAVIGATION_MENU = [
  {
    title: 'Dashboard',
    href: ROUTES.PRIVATE.DASHBOARD,
    icon: 'Home',
    private: true,
  },
  {
    title: 'Wallet',
    href: ROUTES.PRIVATE.WALLET,
    icon: 'Wallet',
    private: true,
  },
  {
    title: 'Trading',
    href: ROUTES.PRIVATE.TRADING,
    icon: 'TrendingUp',
    private: true,
  },
  {
    title: 'Orders',
    href: ROUTES.PRIVATE.ORDERS,
    icon: 'List',
    private: true,
  },
  {
    title: 'Settings',
    href: ROUTES.PRIVATE.SETTINGS,
    icon: 'Settings',
    private: true,
  },
] as const; 