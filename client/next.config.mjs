import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@job-auto-apply/shared"],
  webpack: (config) => {
    config.resolve.alias["@job-auto-apply/shared"] = path.resolve(
      __dirname,
      "../shared/src/index.ts"
    );
    return config;
  },
};

export default nextConfig;
