const isGithubActions = process.env.GITHUB_ACTIONS || false;
const repoName = 'gambtroy';

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isGithubActions ? `/${repoName}` : '',
};

export default nextConfig;
