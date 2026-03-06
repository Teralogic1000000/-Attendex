// Backed/src/app.js

import express from 'express';
import cors from 'cors';
import errorHandler from './Middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import superadminRoutes from './routes/superadminRoutes.js';
import organizationRoutes from './routes/organizationRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import shiftsRoutes from './routes/shiftsRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

// Route prefixes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/shifts', shiftsRoutes);
app.use('/api/superadmin', superadminRoutes);

export default app;