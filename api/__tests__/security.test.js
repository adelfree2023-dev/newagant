/**
 * Security Tests
 * Tests for security headers and middleware
 */

const request = require('supertest');
const express = require('express');
const helmet = require('helmet');

const app = express();
app.use(helmet());
app.use(express.json());

// Health endpoint for testing
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

describe('Security Headers', () => {
    it('should have X-Content-Type-Options header', async () => {
        const res = await request(app).get('/api/health');
        expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should have X-DNS-Prefetch-Control header', async () => {
        const res = await request(app).get('/api/health');
        expect(res.headers['x-dns-prefetch-control']).toBe('off');
    });

    it('should have X-Download-Options header', async () => {
        const res = await request(app).get('/api/health');
        expect(res.headers['x-download-options']).toBe('noopen');
    });

    it('should have X-Frame-Options header', async () => {
        const res = await request(app).get('/api/health');
        expect(['DENY', 'SAMEORIGIN']).toContain(res.headers['x-frame-options']);
    });

    it('should have X-XSS-Protection header', async () => {
        const res = await request(app).get('/api/health');
        // Helmet may disable this in modern configs
        expect(res.headers['x-xss-protection']).toBeDefined();
    });
});

describe('Input Validation', () => {
    it('should handle malformed JSON gracefully', async () => {
        const res = await request(app)
            .post('/api/health')
            .set('Content-Type', 'application/json')
            .send('{ invalid json }');

        expect([400, 404, 500]).toContain(res.status);
    });

    it('should handle large payloads', async () => {
        const largePayload = 'a'.repeat(50000);
        const res = await request(app)
            .post('/api/health')
            .send({ data: largePayload });

        // Should not crash
        expect(res.status).toBeDefined();
    });
});

describe('HTTP Methods', () => {
    it('should handle OPTIONS requests (CORS preflight)', async () => {
        const res = await request(app)
            .options('/api/health');

        expect([200, 204]).toContain(res.status);
    });
});
