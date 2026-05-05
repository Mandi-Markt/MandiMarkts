/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin Turbopack workspace root so Vercel doesn't infer it from parent lockfiles.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
