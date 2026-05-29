import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com', // Google OAuth images
      'avatars.githubusercontent.com',
      'images.unsplash.com',
    ],
  },
};

export default nextConfig;