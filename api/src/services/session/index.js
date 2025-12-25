/**
 * Session Management Service
 * إدارة الجلسات
 * 
 * يجب وضعه في: api/src/services/session/index.js
 */

const crypto = require('crypto');
const { query } = require('../../db');

// Redis client (optional - fallback to memory)
let redisClient = null;
try {
    const Redis = require('ioredis');
    redisClient = new Redis(process.env.REDIS_URL);
} catch (e) {
    console.log('Redis not available, using in-memory sessions');
}

// In-memory fallback
const memorySessions = new Map();

// إعدادات الجلسة
const SESSION_PREFIX = 'session:';
const SESSION_EXPIRY = 24 * 60 * 60; // 24 ساعة بالثواني
const MAX_SESSIONS_PER_USER = 5;

/**
 * إنشاء جلسة جديدة
 */
async function createSession(userId, metadata = {}) {
    const sessionId = crypto.randomUUID();
    const now = Date.now();

    const sessionData = {
        userId,
        createdAt: now,
        lastActivityAt: now,
        expiresAt: now + (SESSION_EXPIRY * 1000),
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress,
        device: parseUserAgent(metadata.userAgent),
    };

    if (redisClient) {
        // تخزين في Redis
        await redisClient.setex(
            SESSION_PREFIX + sessionId,
            SESSION_EXPIRY,
            JSON.stringify(sessionData)
        );

        // إضافة للقائمة الخاصة بالمستخدم
        await redisClient.sadd(`user_sessions:${userId}`, sessionId);

        // التحقق من عدد الجلسات
        await enforceMaxSessions(userId);
    } else {
        // تخزين في الذاكرة
        memorySessions.set(sessionId, sessionData);
    }

    return {
        sessionId,
        expiresAt: sessionData.expiresAt,
    };
}

/**
 * الحصول على بيانات الجلسة
 */
async function getSession(sessionId) {
    if (!sessionId) return null;

    let sessionData = null;

    if (redisClient) {
        const data = await redisClient.get(SESSION_PREFIX + sessionId);
        sessionData = data ? JSON.parse(data) : null;
    } else {
        sessionData = memorySessions.get(sessionId);
    }

    if (!sessionData) return null;

    // التحقق من انتهاء الصلاحية
    if (Date.now() > sessionData.expiresAt) {
        await destroySession(sessionId);
        return null;
    }

    return sessionData;
}

/**
 * تحديث نشاط الجلسة
 */
async function touchSession(sessionId) {
    const session = await getSession(sessionId);
    if (!session) return false;

    session.lastActivityAt = Date.now();
    session.expiresAt = Date.now() + (SESSION_EXPIRY * 1000);

    if (redisClient) {
        await redisClient.setex(
            SESSION_PREFIX + sessionId,
            SESSION_EXPIRY,
            JSON.stringify(session)
        );
    } else {
        memorySessions.set(sessionId, session);
    }

    return true;
}

/**
 * حذف جلسة
 */
async function destroySession(sessionId, userId = null) {
    if (redisClient) {
        await redisClient.del(SESSION_PREFIX + sessionId);
        if (userId) {
            await redisClient.srem(`user_sessions:${userId}`, sessionId);
        }
    } else {
        memorySessions.delete(sessionId);
    }

    return true;
}

/**
 * حذف جميع جلسات المستخدم
 */
async function destroyAllUserSessions(userId) {
    if (redisClient) {
        const sessionIds = await redisClient.smembers(`user_sessions:${userId}`);

        for (const sessionId of sessionIds) {
            await redisClient.del(SESSION_PREFIX + sessionId);
        }

        await redisClient.del(`user_sessions:${userId}`);
    } else {
        for (const [sessionId, session] of memorySessions.entries()) {
            if (session.userId === userId) {
                memorySessions.delete(sessionId);
            }
        }
    }

    return true;
}

/**
 * الحصول على جميع جلسات المستخدم
 */
async function getUserSessions(userId) {
    const sessions = [];

    if (redisClient) {
        const sessionIds = await redisClient.smembers(`user_sessions:${userId}`);

        for (const sessionId of sessionIds) {
            const session = await getSession(sessionId);
            if (session) {
                sessions.push({ sessionId, ...session });
            }
        }
    } else {
        for (const [sessionId, session] of memorySessions.entries()) {
            if (session.userId === userId) {
                sessions.push({ sessionId, ...session });
            }
        }
    }

    return sessions.sort((a, b) => b.lastActivityAt - a.lastActivityAt);
}

/**
 * فرض حد أقصى للجلسات
 */
async function enforceMaxSessions(userId) {
    const sessions = await getUserSessions(userId);

    if (sessions.length > MAX_SESSIONS_PER_USER) {
        // حذف الجلسات الأقدم
        const sessionsToRemove = sessions.slice(MAX_SESSIONS_PER_USER);

        for (const session of sessionsToRemove) {
            await destroySession(session.sessionId, userId);
        }
    }
}

/**
 * تحليل User Agent
 */
function parseUserAgent(userAgent) {
    if (!userAgent) return { device: 'Unknown', browser: 'Unknown', os: 'Unknown' };

    const ua = userAgent.toLowerCase();

    // Device
    let device = 'Desktop';
    if (ua.includes('mobile')) device = 'Mobile';
    else if (ua.includes('tablet') || ua.includes('ipad')) device = 'Tablet';

    // Browser
    let browser = 'Unknown';
    if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari')) browser = 'Safari';
    else if (ua.includes('edge')) browser = 'Edge';

    // OS
    let os = 'Unknown';
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('mac')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

    return { device, browser, os };
}

/**
 * Express handlers
 */
const handlers = {
    /**
     * الحصول على الجلسات النشطة
     * GET /api/auth/sessions
     */
    async getSessions(req, res) {
        try {
            const sessions = await getUserSessions(req.user.id);

            // إخفاء sessionId كاملاً للأمان
            const safeSessions = sessions.map((s, index) => ({
                id: index,
                isCurrent: s.sessionId === req.sessionId,
                device: s.device,
                ipAddress: s.ipAddress ? s.ipAddress.replace(/\d+$/, 'xxx') : 'Unknown',
                lastActivity: new Date(s.lastActivityAt).toISOString(),
                createdAt: new Date(s.createdAt).toISOString(),
            }));

            res.json({
                success: true,
                sessions: safeSessions,
            });
        } catch (error) {
            console.error('Get sessions error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get sessions',
            });
        }
    },

    /**
     * تسجيل الخروج من جميع الأجهزة
     * POST /api/auth/logout-all
     */
    async logoutAll(req, res) {
        try {
            await destroyAllUserSessions(req.user.id);

            // مسح الكوكيز
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');

            res.json({
                success: true,
                message: 'Logged out from all devices',
            });
        } catch (error) {
            console.error('Logout all error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to logout from all devices',
            });
        }
    },
};

module.exports = {
    createSession,
    getSession,
    touchSession,
    destroySession,
    destroyAllUserSessions,
    getUserSessions,
    handlers,
};
