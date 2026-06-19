// Backed/src/app.js

import express from 'express';
import cors from 'cors';
import errorHandler from './Middleware/errorMiddleware.js';
import { attachRoleHelpers } from './Middleware/rbacMiddleware.js';

import authRoutesV2 from './routes/authRoutesV2.js';
import userRoutes from './routes/userRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import superadminRoutes from './routes/superadminRoutes.js';
import organizationRoutes from './routes/organizationRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import shiftsRoutes from './routes/shiftsRoutes.js';
import lookupRoutes from './routes/lookupRoutes.js';
import deviceRoutes from './routes/deviceRoutes.js';
import geofenceRoutes from './routes/geofenceRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import superadminDashboardRoutes from './routes/superadminDashboardRoutes.js';
import organizationAdminDashboardRoutes from './routes/organizationAdminDashboardRoutes.js';
import employeeDashboardRoutes from './routes/employeeDashboardRoutes.js';
import attendanceValidationRoutes from './routes/attendanceValidationRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import validationRoutes from './routes/validationRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

// Attach RBAC helpers to request object (available in all authenticated routes)
app.use(attachRoleHelpers);

// Route prefixes
app.use('/api/auth', authRoutesV2);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/shifts', shiftsRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/lookups', lookupRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/geofence', geofenceRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/superadmin/dashboard', superadminDashboardRoutes);
app.use('/api/org-dashboard', organizationAdminDashboardRoutes);
app.use('/api/employee-dashboard', employeeDashboardRoutes);
app.use('/api/attendance-validation', attendanceValidationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/validation', validationRoutes);

// Global error handler (must be last)
app.use(errorHandler);

export default app;