/**
 * ECOS Platform - Backend API
 * Main server file
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const { logger } = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

// Import routes
const authRoutes = require('./routes/auth');
const casesRoutes = require('./routes/cases');
const categoriesRoutes = require('./routes/categories');
const specialtiesRoutes = require('./routes/specialties');
const userRoutes = require('./routes/user');
const progressRoutes = require('./routes/progress');
const paymentsRoutes = require('./routes/payments');
const generateRoutes = require('./routes/generate');
const statisticsRoutes = require('./routes/statistics');
const feedbackRoutes = require('./routes/feedback');

// Initialize Express app
const app = express();

// Trust proxy (important for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', {
        stream: {
            write: (message) => logger.info(message.trim())
        }
    }));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

// API routes
const API_PREFIX = `/api/${process.env.API_VERSION || 'v1'}`;

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/cases`, casesRoutes);
app.use(`${API_PREFIX}/categories`, categoriesRoutes);
app.use(`${API_PREFIX}/specialties`, specialtiesRoutes);
app.use(`${API_PREFIX}/user`, userRoutes);
app.use(`${API_PREFIX}/progress`, progressRoutes);
app.use(`${API_PREFIX}/payments`, paymentsRoutes);
app.use(`${API_PREFIX}/generate`, generateRoutes);
app.use(`${API_PREFIX}/statistics`, statisticsRoutes);
app.use(`${API_PREFIX}/feedback`, feedbackRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'ECOS Platform API',
        version: process.env.API_VERSION || 'v1',
        documentation: `${API_PREFIX}/docs`,
        status: 'online'
    });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    logger.info(`📚 API available at http://localhost:${PORT}${API_PREFIX}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

module.exports = app;
