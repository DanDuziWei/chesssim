/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // v0.1 slugs → v0.2 slugs (Simulation Match numbering)
      {
        source: "/match/deepseek-vs-gpt-001",
        destination: "/match/deepseek-vs-gpt",
        permanent: true,
      },
      {
        source: "/match/claude-vs-qwen-001",
        destination: "/match/claude-vs-qwen",
        permanent: true,
      },
      {
        source: "/match/deepseek-vs-claude-001",
        destination: "/match/deepseek-vs-claude",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
