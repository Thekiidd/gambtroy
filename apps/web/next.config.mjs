const isProd = process.env.NODE_ENV === 'production';
const repoName = 'gambtroy';

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isProd ? `/${repoName}` : '',
  assetPrefix: isProd ? `/${repoName}/` : '',
};

export default nextConfig;
