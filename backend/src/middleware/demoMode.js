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

// Rate limiting for PIN verification (in-memory store)
const pinAttempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 60 * 60 * 1000; // 1 hour lockout after max attempts

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

// Get client IP (works behind proxies like Render/Cloudflare)
const getClientIP = (req) => {
    return req.headers['cf-connecting-ip'] ||
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.ip ||
        'unknown';
};

export const verifyAdminPin = (req, res) => {
    const { pin } = req.body;
    const clientIP = getClientIP(req);
    const now = Date.now();

    // Get or create attempt record for this IP
    let record = pinAttempts.get(clientIP);

    // Clean up old records and check lockout
    if (record) {
        // Check if locked out
        if (record.lockedUntil && now < record.lockedUntil) {
            const remainingMins = Math.ceil((record.lockedUntil - now) / 60000);
            return res.status(429).json({
                success: false,
                message: `Too many failed attempts. Try again in ${remainingMins} minute${remainingMins > 1 ? 's' : ''}.`,
                retryAfter: remainingMins
            });
        }

        // Reset if window expired
        if (now - record.firstAttempt > WINDOW_MS) {
            record = { attempts: 0, firstAttempt: now };
        }
    } else {
        record = { attempts: 0, firstAttempt: now };
    }

    // Check PIN
    if (pin === ADMIN_PIN) {
        // Success - clear attempts for this IP
        pinAttempts.delete(clientIP);
        return res.json({ success: true, message: 'PIN verified! Full admin access enabled.' });
    }

    // Failed attempt
    record.attempts++;

    if (record.attempts >= MAX_ATTEMPTS) {
        // Lock out this IP
        record.lockedUntil = now + LOCKOUT_MS;
        pinAttempts.set(clientIP, record);
        return res.status(429).json({
            success: false,
            message: 'Too many failed attempts. Locked out for 1 hour.',
            retryAfter: 60
        });
    }

    pinAttempts.set(clientIP, record);
    const remaining = MAX_ATTEMPTS - record.attempts;

    res.status(401).json({
        success: false,
        message: `Invalid PIN. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`
    });
};
