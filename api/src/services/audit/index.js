/**
 * Audit Logger Service
 * خدمة تسجيل العمليات للأمان
 * 
 * يسجل جميع العمليات الحساسة في قاعدة البيانات
 * يجب وضعه في: api/src/services/audit/index.js
 */

const { query } = require('../../db');

// أنواع الأحداث
const AUDIT_EVENTS = {
    // Auth
    AUTH_LOGIN_SUCCESS: 'auth.login.success',
    AUTH_LOGIN_FAILED: 'auth.login.failed',
    AUTH_LOGOUT: 'auth.logout',
    AUTH_REGISTER: 'auth.register',
    AUTH_PASSWORD_RESET: 'auth.password_reset',
    AUTH_2FA_ENABLED: 'auth.2fa.enabled',
    AUTH_2FA_DISABLED: 'auth.2fa.disabled',

    // Orders
    ORDER_CREATED: 'order.created',
    ORDER_UPDATED: 'order.updated',
    ORDER_CANCELLED: 'order.cancelled',
    ORDER_SHIPPED: 'order.shipped',
    ORDER_DELIVERED: 'order.delivered',

    // Products
    PRODUCT_CREATED: 'product.created',
    PRODUCT_UPDATED: 'product.updated',
    PRODUCT_DELETED: 'product.deleted',
    PRODUCT_STOCK_UPDATED: 'product.stock.updated',

    // Users
    USER_CREATED: 'user.created',
    USER_UPDATED: 'user.updated',
    USER_DELETED: 'user.deleted',
    USER_ROLE_CHANGED: 'user.role.changed',

    // Settings
    SETTINGS_UPDATED: 'settings.updated',
    WEBHOOK_CREATED: 'webhook.created',

    // Security
    SECURITY_SUSPICIOUS_ACTIVITY: 'security.suspicious',
    SECURITY_BLOCKED_IP: 'security.blocked_ip',
    SECURITY_RATE_LIMITED: 'security.rate_limited',
};

/**
 * تسجيل حدث في سجل المراجعة
 */
async function log({
    tenantId,
    userId,
    event,
    entityType,
    entityId,
    metadata = {},
    ipAddress,
    userAgent,
}) {
    try {
        const result = await query(
            `INSERT INTO audit_logs 
       (tenant_id, user_id, event, entity_type, entity_id, metadata, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
            [
                tenantId,
                userId,
                event,
                entityType,
                entityId,
                JSON.stringify(metadata),
                ipAddress,
                userAgent,
            ]
        );

        return result.rows[0];
    } catch (error) {
        console.error('Audit log error:', error);
        // لا نريد أن يفشل الطلب بسبب فشل التسجيل
        return null;
    }
}

/**
 * البحث في سجلات المراجعة
 */
async function search({
    tenantId,
    userId,
    event,
    entityType,
    entityId,
    startDate,
    endDate,
    limit = 50,
    offset = 0,
}) {
    let queryText = `
    SELECT al.*, u.email as user_email, u.first_name as user_name
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE al.tenant_id = $1
  `;
    const params = [tenantId];
    let paramCount = 1;

    if (userId) {
        paramCount++;
        queryText += ` AND al.user_id = $${paramCount}`;
        params.push(userId);
    }

    if (event) {
        paramCount++;
        queryText += ` AND al.event = $${paramCount}`;
        params.push(event);
    }

    if (entityType) {
        paramCount++;
        queryText += ` AND al.entity_type = $${paramCount}`;
        params.push(entityType);
    }

    if (entityId) {
        paramCount++;
        queryText += ` AND al.entity_id = $${paramCount}`;
        params.push(entityId);
    }

    if (startDate) {
        paramCount++;
        queryText += ` AND al.created_at >= $${paramCount}`;
        params.push(startDate);
    }

    if (endDate) {
        paramCount++;
        queryText += ` AND al.created_at <= $${paramCount}`;
        params.push(endDate);
    }

    queryText += ` ORDER BY al.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await query(queryText, params);
    return result.rows;
}

/**
 * الحصول على إحصائيات الأحداث
 */
async function getStats(tenantId, days = 7) {
    const result = await query(
        `SELECT 
       event,
       COUNT(*) as count,
       DATE(created_at) as date
     FROM audit_logs
     WHERE tenant_id = $1 
       AND created_at >= NOW() - INTERVAL '${days} days'
     GROUP BY event, DATE(created_at)
     ORDER BY date DESC`,
        [tenantId]
    );

    return result.rows;
}

/**
 * Middleware لتسجيل الطلبات تلقائياً
 */
function auditMiddleware(eventType, entityType) {
    return async (req, res, next) => {
        // حفظ الدالة الأصلية
        const originalJson = res.json.bind(res);

        res.json = async function (data) {
            // تسجيل العملية إذا نجحت
            if (res.statusCode < 400 && req.user) {
                await log({
                    tenantId: req.tenant_id,
                    userId: req.user.id,
                    event: eventType,
                    entityType: entityType,
                    entityId: data?.id || req.params.id,
                    metadata: {
                        method: req.method,
                        path: req.path,
                        body: req.method !== 'GET' ? req.body : undefined,
                    },
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent'),
                });
            }

            return originalJson(data);
        };

        next();
    };
}

/**
 * تسجيل محاولة دخول فاشلة
 */
async function logFailedLogin(email, ipAddress, userAgent, reason) {
    await log({
        tenantId: null,
        userId: null,
        event: AUDIT_EVENTS.AUTH_LOGIN_FAILED,
        entityType: 'user',
        entityId: null,
        metadata: { email, reason },
        ipAddress,
        userAgent,
    });
}

/**
 * تسجيل دخول ناجح
 */
async function logSuccessfulLogin(tenantId, userId, ipAddress, userAgent) {
    await log({
        tenantId,
        userId,
        event: AUDIT_EVENTS.AUTH_LOGIN_SUCCESS,
        entityType: 'user',
        entityId: userId,
        metadata: {},
        ipAddress,
        userAgent,
    });
}

/**
 * تسجيل نشاط مشبوه
 */
async function logSuspiciousActivity(tenantId, userId, activity, ipAddress, userAgent) {
    await log({
        tenantId,
        userId,
        event: AUDIT_EVENTS.SECURITY_SUSPICIOUS_ACTIVITY,
        entityType: 'security',
        entityId: null,
        metadata: { activity },
        ipAddress,
        userAgent,
    });
}

module.exports = {
    AUDIT_EVENTS,
    log,
    search,
    getStats,
    auditMiddleware,
    logFailedLogin,
    logSuccessfulLogin,
    logSuspiciousActivity,
};
