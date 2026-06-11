/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    API_FOOTBALL_KEY: process.env.API_FOOTBALL_KEY,
    API_FOOTBALL_HOST: process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io',
  },
}

module.exports = nextConfig
