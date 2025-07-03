import { body, param } from 'express-validator';

// URL validation
export const validateCreateUrl = [
    body('url')
        .isURL({ protocols: ['http', 'https'], require_protocol: true })
        .withMessage('Please provide a valid URL with http:// or https://')
        .isLength({ max: 2048 })
        .withMessage('URL must be less than 2048 characters')
        .custom((value) => {
            // Block localhost and private IPs in production
            if (process.env.NODE_ENV === 'production') {
                const url = new URL(value);
                const hostname = url.hostname.toLowerCase();
                
                if (hostname === 'localhost' || 
                    hostname === '127.0.0.1' || 
                    hostname.startsWith('192.168.') ||
                    hostname.startsWith('10.') ||
                    hostname.startsWith('172.')) {
                    throw new Error('Private/local URLs are not allowed');
                }
            }
            return true;
        }),
    
    body('slug')
        .optional()
        .isLength({ min: 3, max: 50 })
        .withMessage('Custom slug must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Custom slug can only contain letters, numbers, hyphens, and underscores')
        .custom((value) => {
            // Reserved words that cannot be used as slugs
            const reserved = ['api', 'admin', 'www', 'mail', 'ftp', 'localhost', 'health', 'auth', 'create', 'urls'];
            if (reserved.includes(value.toLowerCase())) {
                throw new Error('This slug is reserved and cannot be used');
            }
            return true;
        })
];

// Authentication validation
export const validateRegister = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),
    
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .isLength({ max: 254 })
        .withMessage('Email must be less than 254 characters'),
    
    body('password')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character')
];

export const validateLogin = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// URL redirect validation
export const validateUrlRedirect = [
    param('id')
        .isLength({ min: 1, max: 50 })
        .withMessage('Invalid URL ID')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Invalid URL ID format')
];

// Rate limiting validation
export const validateRateLimit = (req, res, next) => {
    const userAgent = req.get('User-Agent');
    const ip = req.ip;
    
    // Block suspicious user agents
    if (!userAgent || userAgent.length < 10) {
        return res.status(400).json({
            success: false,
            message: 'Invalid request'
        });
    }
    
    // Log suspicious activity
    if (process.env.NODE_ENV === 'production') {
        console.log(`Request from IP: ${ip}, User-Agent: ${userAgent}`);
    }
    
    next();
};
