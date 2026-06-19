// Subscription Plans Configuration
export const SUBSCRIPTION_PLANS = {
  BASIC: {
    id: 'basic',
    name: 'Basic',
    maxUsers: 5,
    price: 0,
    duration: 30, // days
    features: [
      'Limited features',
      'Core system access',
      'Up to 5 team members',
      'Basic support'
    ]
  },
  STANDARD: {
    id: 'standard',
    name: 'Standard',
    maxUsers: 10,
    price: 15,
    duration: 30,
    features: [
      'Up to 10 team members',
      'Advanced reporting',
      'More dashboard features',
      'Better support',
      'More storage (100GB)'
    ]
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    maxUsers: 999,
    price: 30,
    duration: 30,
    features: [
      'Up to 999 team members',
      'Advanced analytics',
      'Export to CSV/Excel',
      'Custom roles',
      'API access',
      'Priority support',
      'Unlimited storage'
    ]
  }
};

export const PLAN_IDS = {
  BASIC: 'basic',
  STANDARD: 'standard',
  PRO: 'pro'
};

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  PENDING: 'PENDING'
};

// Feature access control based on plan
export const FEATURE_ACCESS = {
  BASIC: {
    maxUsers: 5,
    analytics: false,
    export: false,
    customRoles: false,
    apiAccess: false,
    prioritySupport: false
  },
  STANDARD: {
    maxUsers: 10,
    analytics: false,
    export: false,
    customRoles: false,
    apiAccess: false,
    prioritySupport: false
  },
  PRO: {
    maxUsers: 999,
    analytics: true,
    export: true,
    customRoles: true,
    apiAccess: true,
    prioritySupport: true
  }
};
