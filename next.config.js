/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        stackbitPreview: process.env.STACKBIT_PREVIEW
    },
    trailingSlash: true,
    reactStrictMode: true,
    swcMinify: true,
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=86400, immutable', // 1 day cache time
                    },
                    {
                        key: 'Link',
                        value: '</images/purple-haze.jpg>; rel=preload; as=image',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;