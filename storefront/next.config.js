/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        domains: ['localhost', 'placeholder.com', 'via.placeholder.com'],
        unoptimized: true,
    },
}

module.exports = nextConfig
