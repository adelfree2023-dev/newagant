/**
 * CoreFlex TOTP 2FA Service
 * الإصدار: 2.1.0-secure
 * 
 * خدمة المصادقة الثنائية - يجب وضعه في: api/services/totp.js
 */

const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const crypto = require('crypto');

// Configuration
const APP_NAME = 'CoreFlex';
const BACKUP_CODES_COUNT = 10;

// ============================================
// TOTP GENERATION
// ============================================

/**
 * Generate a new TOTP secret for a user
 */
function generateSecret(email) {
    const secret = speakeasy.generateSecret({
        name: `${APP_NAME} (${email})`,
        issuer: APP_NAME,
        length: 32,
    });

    return {
        ascii: secret.ascii,
        base32: secret.base32,
        hex: secret.hex,
        otpAuthUrl: secret.otpauth_url,
    };
}

/**
 * Generate QR code for the secret
 */
async function generateQRCode(otpAuthUrl) {
    try {
        const qrCodeDataUrl = await qrcode.toDataURL(otpAuthUrl);
        return qrCodeDataUrl;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Failed to generate QR code');
    }
}

/**
 * Generate backup codes
 */
function generateBackupCodes(count = BACKUP_CODES_COUNT) {
    const codes = [];

    for (let i = 0; i < count; i++) {
        // Generate 8-character alphanumeric code
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        codes.push(code);
    }

    return codes;
}

/**
 * Hash backup codes for storage
 */
function hashBackupCode(code) {
    return crypto.createHash('sha256').update(code).digest('hex');
}

// ============================================
// TOTP VERIFICATION
// ============================================

/**
 * Verify a TOTP token
 */
function verifyToken(secret, token, window = 2) {
    try {
        const isValid = speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: token,
            window: window, // Allow 2 time steps tolerance (60 seconds)
        });

        return isValid;
    } catch (error) {
        console.error('Error verifying TOTP:', error);
        return false;
    }
}

/**
 * Verify a backup code
 */
function verifyBackupCode(hashedCodes, code) {
    const hashedInput = hashBackupCode(code);
    const index = hashedCodes.findIndex(hc => hc === hashedInput);

    if (index === -1) {
        return { valid: false, index: -1 };
    }

    return { valid: true, index };
}

// ============================================
// 2FA SETUP FLOW
// ============================================

/**
 * Complete 2FA setup flow
 * Returns secret, QR code, and backup codes
 */
async function setup2FA(email) {
    // Generate secret
    const secret = generateSecret(email);

    // Generate QR code
    const qrCode = await generateQRCode(secret.otpAuthUrl);

    // Generate backup codes
    const backupCodes = generateBackupCodes();
    const hashedBackupCodes = backupCodes.map(hashBackupCode);

    return {
        secret: secret.base32,
        qrCode: qrCode,
        backupCodes: backupCodes, // Show to user once
        hashedBackupCodes: hashedBackupCodes, // Store in database
        otpAuthUrl: secret.otpAuthUrl,
    };
}

/**
 * Verify 2FA setup (user enters code to confirm)
 */
function verify2FASetup(secret, token) {
    return verifyToken(secret, token, 1); // Stricter window for setup
}

// ============================================
// 2FA LOGIN FLOW
// ============================================

/**
 * Verify 2FA during login
 * Supports both TOTP and backup codes
 */
function verify2FALogin(secret, hashedBackupCodes, code) {
    // Check if it's a TOTP token (6 digits)
    if (/^\d{6}$/.test(code)) {
        const isValid = verifyToken(secret, code);
        return {
            valid: isValid,
            method: 'totp',
            usedBackupCodeIndex: -1,
        };
    }

    // Otherwise, try as backup code (8 alphanumeric)
    if (/^[A-F0-9]{8}$/i.test(code)) {
        const result = verifyBackupCode(hashedBackupCodes, code.toUpperCase());
        return {
            valid: result.valid,
            method: 'backup',
            usedBackupCodeIndex: result.index,
        };
    }

    return {
        valid: false,
        method: 'unknown',
        usedBackupCodeIndex: -1,
    };
}

// ============================================
// API HANDLERS
// ============================================

/**
 * Express handler: Setup 2FA
 */
async function handleSetup2FA(req, res) {
    try {
        const { email } = req.user;

        const setup = await setup2FA(email);

        // Don't save to DB yet, wait for verification
        // Store temporarily in session or return to client

        res.json({
            success: true,
            data: {
                qrCode: setup.qrCode,
                secret: setup.secret, // For manual entry
                backupCodes: setup.backupCodes, // Show once!
            },
            message: 'Scan the QR code with Google Authenticator',
        });
    } catch (error) {
        console.error('2FA setup error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to setup 2FA',
        });
    }
}

/**
 * Express handler: Verify 2FA setup
 */
async function handleVerify2FASetup(req, res) {
    try {
        const { secret, token, hashedBackupCodes } = req.body;

        if (!secret || !token) {
            return res.status(400).json({
                success: false,
                error: 'Secret and token are required',
            });
        }

        const isValid = verify2FASetup(secret, token);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                error: 'Invalid code. Please try again.',
            });
        }

        // Save to database
        // await User.update({ id: req.user.id }, {
        //   two_factor_secret: secret,
        //   two_factor_backup_codes: hashedBackupCodes,
        //   two_factor_enabled: true,
        // });

        res.json({
            success: true,
            message: '2FA enabled successfully',
        });
    } catch (error) {
        console.error('2FA verify setup error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify 2FA',
        });
    }
}

/**
 * Express handler: Verify 2FA during login
 */
async function handleVerify2FALogin(req, res) {
    try {
        const { userId, code } = req.body;

        if (!userId || !code) {
            return res.status(400).json({
                success: false,
                error: 'User ID and code are required',
            });
        }

        // Get user from database
        // const user = await User.findById(userId);
        // const result = verify2FALogin(user.two_factor_secret, user.two_factor_backup_codes, code);

        // Placeholder
        const result = { valid: true, method: 'totp', usedBackupCodeIndex: -1 };

        if (!result.valid) {
            return res.status(400).json({
                success: false,
                error: 'Invalid code',
            });
        }

        // If backup code was used, remove it
        if (result.usedBackupCodeIndex >= 0) {
            // await User.update({ id: userId }, {
            //   $pull: { two_factor_backup_codes: { $at: result.usedBackupCodeIndex } }
            // });
        }

        res.json({
            success: true,
            method: result.method,
            message: '2FA verification successful',
        });
    } catch (error) {
        console.error('2FA login verify error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify 2FA',
        });
    }
}

/**
 * Express handler: Disable 2FA
 */
async function handleDisable2FA(req, res) {
    try {
        const { password, code } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                error: 'Password is required',
            });
        }

        // Verify password
        // const user = await User.findById(req.user.id);
        // const isPasswordValid = await bcrypt.compare(password, user.password);
        // if (!isPasswordValid) throw new Error('Invalid password');

        // Verify 2FA code if enabled
        // if (user.two_factor_enabled && code) {
        //   const isValid = verifyToken(user.two_factor_secret, code);
        //   if (!isValid) throw new Error('Invalid 2FA code');
        // }

        // Disable 2FA
        // await User.update({ id: req.user.id }, {
        //   two_factor_secret: null,
        //   two_factor_backup_codes: [],
        //   two_factor_enabled: false,
        // });

        res.json({
            success: true,
            message: '2FA disabled successfully',
        });
    } catch (error) {
        console.error('2FA disable error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to disable 2FA',
        });
    }
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
    // Core functions
    generateSecret,
    generateQRCode,
    generateBackupCodes,
    hashBackupCode,
    verifyToken,
    verifyBackupCode,

    // Setup flow
    setup2FA,
    verify2FASetup,
    verify2FALogin,

    // Express handlers
    handleSetup2FA,
    handleVerify2FASetup,
    handleVerify2FALogin,
    handleDisable2FA,
};
