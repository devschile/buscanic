import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  crons: [
    {
      path: '/api/check',
      schedule: '0 0 * * *',
    },
  ],
};

export default nextConfig;