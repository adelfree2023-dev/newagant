/**
 * Jest Configuration for CoreFlex API
 */
module.exports = {
    testEnvironment: 'node',

    // Coverage settings
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/index.js',
        '!src/db.js'
    ],

    // Test patterns
    testMatch: [
        '**/__tests__/**/*.js',
        '**/*.test.js',
        '**/*.spec.js'
    ],

    // Ignore patterns
    testPathIgnorePatterns: [
        '/node_modules/'
    ],

    // Coverage thresholds
    coverageThreshold: {
        global: {
            branches: 60,
            functions: 60,
            lines: 60,
            statements: 60
        }
    },

    // Timeout for async tests
    testTimeout: 10000,

    // Verbose output
    verbose: true
};
