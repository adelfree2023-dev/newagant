/**
 * Next.js Configuration
 * إعدادات Next.js للإنتاج
 * 
 * يجب وضعه في: storefront/next.config.js
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable standalone output for Docker
    output: 'standalone',

    // Disable x-powered-by header
    poweredByHeader: false,

    // Enable React strict mode
    reactStrictMode: true,

    // Image optimization
    images: {
        domains: [
            'localhost',
            'storage.googleapis.com',
            'res.cloudinary.com',
            'images.unsplash.com',
        ],
        unoptimized: process.env.NODE_ENV === 'development',
    },

    // Experimental features
    experimental: {
        // Optimize package imports
        optimizePackageImports: ['lucide-react'],
    },

    // Environment variables
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    },

    // Webpack configuration
    webpack: (config, { isServer }) => {
        // Fix for some packages
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
            };
        }
        return config;
    },

    // Headers for security
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
