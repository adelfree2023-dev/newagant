/**
 * Auth Routes Tests
 * Tests for authentication endpoints
 */

const request = require('supertest');

// Mock the database
jest.mock('../src/db', () => ({
    query: jest.fn()
}));

// Create a simple test app
const express = require('express');
const app = express();
app.use(express.json());

// Import routes after mocking
const authRoutes = require('../src/routes/auth');
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/login', () => {
        it('should reject request with missing email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ password: 'test123' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should reject request with missing password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@test.com' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should reject empty request body', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({});

            expect(res.status).toBe(400);
        });

        it('should reject invalid email format', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'invalid-email', password: 'test123' });

            // Should either be 400 (bad format) or 401 (no user found)
            expect([400, 401]).toContain(res.status);
        });
    });

    describe('POST /api/auth/register', () => {
        it('should reject weak passwords', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@test.com',
                    password: '123',
                    name: 'Test User'
                });

            expect([400, 422]).toContain(res.status);
        });
    });

    describe('GET /api/auth/me', () => {
        it('should reject request without auth token', async () => {
            const res = await request(app)
                .get('/api/auth/me');

            expect([401, 403]).toContain(res.status);
        });

        it('should reject request with invalid token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid.token.here');

            expect([401, 403]).toContain(res.status);
        });
    });
});
