/**
 * Products Routes Tests
 * Tests for product listing and details endpoints
 */

const request = require('supertest');

// Mock the database
const mockQuery = jest.fn();
jest.mock('../src/db', () => ({
    query: (...args) => mockQuery(...args)
}));

const express = require('express');
const app = express();
app.use(express.json());

// Import routes
const productsRoutes = require('../src/routes/products');
app.use('/api/products', productsRoutes);

describe('Products Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/products', () => {
        it('should return products list', async () => {
            mockQuery.mockResolvedValueOnce({
                rows: [
                    { id: '1', name: 'Product 1', price: 100 },
                    { id: '2', name: 'Product 2', price: 200 }
                ]
            });

            const res = await request(app)
                .get('/api/products');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should handle pagination with limit', async () => {
            mockQuery.mockResolvedValueOnce({ rows: [] });

            const res = await request(app)
                .get('/api/products?limit=10');

            expect(res.status).toBe(200);
        });

        it('should filter by category', async () => {
            mockQuery.mockResolvedValueOnce({ rows: [] });

            const res = await request(app)
                .get('/api/products?category_id=123');

            expect(res.status).toBe(200);
        });

        it('should handle sorting', async () => {
            mockQuery.mockResolvedValueOnce({ rows: [] });

            const res = await request(app)
                .get('/api/products?sort=price_asc');

            expect(res.status).toBe(200);
        });
    });

    describe('GET /api/products/:id', () => {
        it('should return product by ID', async () => {
            mockQuery.mockResolvedValueOnce({
                rows: [{ id: '1', name: 'Product 1', price: 100 }]
            });

            const res = await request(app)
                .get('/api/products/1');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should return 404 for non-existent product', async () => {
            mockQuery.mockResolvedValueOnce({ rows: [] });

            const res = await request(app)
                .get('/api/products/non-existent-id');

            expect(res.status).toBe(404);
        });
    });

    describe('GET /api/products/search', () => {
        it('should search products by query', async () => {
            mockQuery.mockResolvedValueOnce({
                rows: [{ id: '1', name: 'Test Product', price: 100 }]
            });

            const res = await request(app)
                .get('/api/products/search?q=test');

            expect(res.status).toBe(200);
        });
    });
});
