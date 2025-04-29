import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
    domains: ['cdn.pixabay.com','static.vecteezy.com','res.cloudinary.com']
  },
  async rewrites(){
    return [
      {
        source: '/',
        destination: '/home',
      }
    ]
  }
};

export default nextConfig;
