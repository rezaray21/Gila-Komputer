import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Ilustrasi produk gratis dari picsum.photos (seed tetap = gambar tetap).
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
};

export default nextConfig;
