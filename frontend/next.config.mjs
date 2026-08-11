/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // Unsplash's API guidelines require hotlinking their CDN rather than
    // re-hosting, so BrandBackdrop uses a custom loader that points straight
    // at images.unsplash.com. This entry keeps next/image happy with the host.
    remotePatterns: [new URL("https://images.unsplash.com/**")],
  },
};

export default nextConfig;
