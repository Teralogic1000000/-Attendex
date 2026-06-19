/**
 * Enhanced Authentication Routes - STEP 21
 * Updated endpoints for all authentication flows
 */

import express from 'express';
import {
  registerEmployee,
  registerOrganization,
  registerSuperAdmin,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  verifyCredentials
} from '../controllers/authControllerV2.js';
import verifyToken from '../Middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/auth/register/employee
 * Register new employee user
 * Body: { firstName, lastName, email, password, phoneNumber, organizationId, departmentId }
 */
router.post('/register/employee', registerEmployee);

/**
 * POST /api/auth/register/organization
 * Register new organization with admin user
 * Body: { firstName, lastName, email, password, organizationName, phoneNumber, address, logoUrl, theme }
 */
router.post('/register/organization', registerOrganization);

/**
 * POST /api/auth/register/superadmin
 * Register Super Admin (System Administrator)
 * Body: { firstName, lastName, email, password, adminSecret }
 * Note: Requires valid admin secret key for security
 */
router.post('/register/superadmin', registerSuperAdmin);

/**
 * POST /api/auth/login
 * Login with email and password
 * Body: { email, password }
 * Returns: { user, tokens: { accessToken, refreshToken } }
 */
router.post('/login', login);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 * Body: { refreshToken }
 * Returns: { accessToken, refreshToken, expiresIn }
 */
router.post('/refresh', refreshToken);

/**
 * POST /api/auth/logout
 * Logout user (requires authentication)
 * Headers: Authorization: Bearer <token>
 */
router.post('/logout', verifyToken, logout);

/**
 * GET /api/auth/me
 * Get current user profile
 * Headers: Authorization: Bearer <token>
 */
router.get('/me', verifyToken, getCurrentUser);

/**
 * POST /api/auth/verify
 * Verify user credentials (for testing)
 * Body: { email, password }
 */
router.post('/verify', verifyCredentials);

/**
 * GET /api/auth/help
 * Get authentication endpoints documentation
 */
router.get('/help', (req, res) => {
  const documentation = {
    description: 'Enhanced Authentication API - STEP 21',
    baseUrl: '/api/auth',
    endpoints: [
      {
        method: 'POST',
        path: '/register/employee',
        description: 'Register a new employee user',
        requiresAuth: false,
        body: {
          firstName: 'string (required)',
          lastName: 'string (required)',
          email: 'string (required, unique)',
          password: 'string (required, min 6 chars)',
          phoneNumber: 'string (optional)',
          organizationId: 'integer (optional)',
          departmentId: 'integer (optional)',
          userTypeId: 'integer (optional, defaults to Employee)'
        },
        response: {
          status: 201,
          body: {
            user: {
              id: 'integer',
              firstName: 'string',
              lastName: 'string',
              email: 'string',
              userType: 'string (Employee|Manager|Contractor|Intern)',
              organizationId: 'integer|null',
              departmentId: 'integer|null',
              status: 'Active'
            },
            tokens: {
              accessToken: 'JWT token',
              refreshToken: 'JWT token',
              type: 'Bearer',
              expiresIn: '24h'
            }
          }
        }
      },
      {
        method: 'POST',
        path: '/register/organization',
        description: 'Register a new organization with admin user',
        requiresAuth: false,
        body: {
          firstName: 'string (required)',
          lastName: 'string (required)',
          email: 'string (required, unique)',
          password: 'string (required)',
          organizationName: 'string (required, unique)',
          phoneNumber: 'string (optional)',
          address: 'string (optional)',
          logoUrl: 'string (optional)',
          theme: 'string (optional, default: "light")'
        },
        response: {
          status: 201,
          body: {
            organization: {
              id: 'integer',
              name: 'string',
              status: 'Active'
            },
            user: {
              id: 'integer',
              firstName: 'string',
              lastName: 'string',
              email: 'string',
              userType: 'Org_Admin',
              organizationId: 'integer'
            },
            tokens: {
              accessToken: 'JWT token',
              refreshToken: 'JWT token',
              type: 'Bearer'
            }
          }
        }
      },
      {
        method: 'POST',
        path: '/login',
        description: 'Login with email and password (supports all user types)',
        requiresAuth: false,
        body: {
          email: 'string (required)',
          password: 'string (required)'
        },
        response: {
          status: 200,
          body: {
            user: {
              id: 'integer',
              firstName: 'string',
              lastName: 'string',
              email: 'string',
              userType: 'string (Super_Admin|Org_Admin|Manager|Employee|Contractor|Intern)',
              organizationId: 'integer|null',
              departmentId: 'integer|null',
              status: 'Active'
            },
            organization: {
              id: 'integer',
              name: 'string',
              logoUrl: 'string|null',
              theme: 'string'
            },
            department: {
              id: 'integer',
              name: 'string'
            },
            tokens: {
              accessToken: 'JWT token',
              refreshToken: 'JWT token',
              type: 'Bearer',
              expiresIn: '24h'
            }
          }
        }
      },
      {
        method: 'POST',
        path: '/refresh',
        description: 'Refresh access token using refresh token',
        requiresAuth: false,
        body: {
          refreshToken: 'string (required)'
        },
        response: {
          status: 200,
          body: {
            accessToken: 'new JWT token',
            refreshToken: 'new JWT token',
            type: 'Bearer',
            expiresIn: '24h'
          }
        }
      },
      {
        method: 'POST',
        path: '/logout',
        description: 'Logout user and invalidate refresh token',
        requiresAuth: true,
        headers: {
          Authorization: 'Bearer <accessToken>'
        },
        response: {
          status: 200,
          body: {
            timestamp: 'ISO 8601 datetime'
          }
        }
      },
      {
        method: 'GET',
        path: '/me',
        description: 'Get current user profile',
        requiresAuth: true,
        headers: {
          Authorization: 'Bearer <accessToken>'
        },
        response: {
          status: 200,
          body: {
            user: {
              id: 'integer',
              firstName: 'string',
              lastName: 'string',
              email: 'string',
              phoneNumber: 'string|null',
              userType: 'string',
              organizationId: 'integer|null',
              departmentId: 'integer|null',
              status: 'Active',
              createdAt: 'ISO 8601 datetime',
              updatedAt: 'ISO 8601 datetime'
            },
            organization: {
              id: 'integer',
              name: 'string',
              logoUrl: 'string|null',
              theme: 'string'
            },
            department: {
              id: 'integer',
              name: 'string'
            }
          }
        }
      },
      {
        method: 'POST',
        path: '/verify',
        description: 'Verify user credentials (for testing)',
        requiresAuth: false,
        body: {
          email: 'string (required)',
          password: 'string (required)'
        },
        response: {
          status: 200,
          body: {
            valid: 'boolean',
            reason: 'string',
            userStatus: 'Active|Inactive|Suspended'
          }
        }
      },
      {
        method: 'GET',
        path: '/help',
        description: 'Get authentication endpoints documentation',
        requiresAuth: false
      }
    ],
    errorCodes: {
      400: 'Bad Request - Missing or invalid parameters',
      401: 'Unauthorized - Invalid credentials or expired token',
      403: 'Forbidden - User account is inactive or suspended',
      404: 'Not Found - User not found',
      409: 'Conflict - Email or organization name already exists',
      500: 'Internal Server Error - Server processing error'
    },
    tokenClaims: {
      accessToken: {
        id: 'User ID',
        email: 'User email',
        user_type_name: 'User type (Super_Admin, Org_Admin, etc)',
        organization_id: 'Organization ID',
        expiresIn: '24 hours'
      },
      refreshToken: {
        id: 'User ID',
        email: 'User email',
        expiresIn: '7 days'
      }
    },
    examples: {
      registerEmployee: {
        request: {
          method: 'POST',
          url: '/api/auth/register/employee',
          body: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'SecurePass123!',
            phoneNumber: '+1234567890',
            organizationId: 1,
            departmentId: 5
          }
        },
        response: {
          status: 201,
          body: {
            user: {
              id: 42,
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              userType: 'Employee',
              organizationId: 1,
              departmentId: 5,
              status: 'Active'
            },
            tokens: {
              accessToken: 'eyJhbGc...',
              refreshToken: 'eyJhbGc...',
              type: 'Bearer',
              expiresIn: '24h'
            }
          }
        }
      },
      login: {
        request: {
          method: 'POST',
          url: '/api/auth/login',
          body: {
            email: 'john@example.com',
            password: 'SecurePass123!'
          }
        },
        response: {
          status: 200,
          body: {
            user: {
              id: 42,
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              userType: 'Employee',
              organizationId: 1,
              status: 'Active'
            },
            tokens: {
              accessToken: 'eyJhbGc...',
              refreshToken: 'eyJhbGc...',
              type: 'Bearer',
              expiresIn: '24h'
            }
          }
        }
      },
      refreshToken: {
        request: {
          method: 'POST',
          url: '/api/auth/refresh',
          body: {
            refreshToken: 'eyJhbGc...'
          }
        },
        response: {
          status: 200,
          body: {
            accessToken: 'eyJhbGc...',
            refreshToken: 'eyJhbGc...',
            type: 'Bearer',
            expiresIn: '24h'
          }
        }
      }
    }
  };

  res.status(200).json({
    status: 'success',
    data: documentation
  });
});

export default router;
