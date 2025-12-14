/**
 * Demo Mode Middleware
 * 
 * Restricts destructive actions (POST, PUT, DELETE) in demo mode
 * unless the user provides the correct admin PIN via x-admin-pin header.
 * 
 * This protects the demo from vandalism while allowing recruiters
 * with the PIN to test full admin functionality.
 */

const ADMIN_PIN = process.env.ADMIN_PIN || '23851';
const DEMO_MODE = process.env.DEMO_MODE === 'true';

// Routes that should be protected in demo mode (only menu modifications)
const PROTECTED_PATTERNS = [
    { method: 'DELETE', path: /^\/api\/v1\/menu/ },
    { method: 'PUT', path: /^\/api\/v1\/menu/ },
    { method: 'POST', path: /^\/api\/v1\/menu/ },
];

// Routes that are always allowed (even in demo mode)
const ALLOWED_PATTERNS = [
    { method: 'POST', path: /^\/api\/v1\/auth/ },  // Login/register
    { method: 'POST', path: /^\/api\/v1\/orders$/ },  // Creating orders (customer action)
    { method: 'POST', path: /^\/api\/v1\/reservations$/ },  // Creating reservations
    { method: 'POST', path: /^\/api\/v1\/feedback/ },  // Submitting feedback
    { method: 'POST', path: /^\/api\/v1\/reviews/ },  // Submitting reviews
    { method: 'POST', path: /^\/api\/v1\/ai/ },  // AI features
];

export const demoModeMiddleware = (req, res, next) => {
    // Skip if demo mode is disabled
    if (!DEMO_MODE) {
        return next();
    }

    // Allow all GET requests
    if (req.method === 'GET') {
        return next();
    }

    // Check if this route is always allowed
    const isAllowed = ALLOWED_PATTERNS.some(
        pattern => pattern.method === req.method && pattern.path.test(req.path)
    );
    if (isAllowed) {
        return next();
    }

    // Check if this route is protected
    const isProtected = PROTECTED_PATTERNS.some(
        pattern => pattern.method === req.method && pattern.path.test(req.path)
    );

    if (isProtected) {
        // Check for admin PIN
        const providedPin = req.headers['x-admin-pin'];

        if (providedPin === ADMIN_PIN) {
            // PIN is correct, allow the action
            return next();
        }

        // Block the action
        return res.status(403).json({
            success: false,
            message: '🔒 Demo Mode: This action is disabled. Enter admin PIN for full access.',
            demoMode: true
        });
    }

    // For other routes, allow by default
    next();
};

export const verifyAdminPin = (req, res) => {
    const { pin } = req.body;

    if (pin === ADMIN_PIN) {
        res.json({ success: true, message: 'PIN verified! Full admin access enabled.' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid PIN' });
    }
};
