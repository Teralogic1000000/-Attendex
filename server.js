import dotenv from 'dotenv';
dotenv.config();

import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import app from './Backed/src/app.js';

const PORT = process.env.PORT || 3000;

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// Apply middleware
app.use(morgan('dev'));
app.use(helmet());
app.use(limiter);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});