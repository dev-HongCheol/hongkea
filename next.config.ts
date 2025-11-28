import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://supa.devhong.cc/**")],
  },
};

export default nextConfig;
