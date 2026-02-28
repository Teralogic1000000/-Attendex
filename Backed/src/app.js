// Backed/src/app.js

import express from 'express';
import cors from 'cors';


import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());


// Route prefixes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

export default app;