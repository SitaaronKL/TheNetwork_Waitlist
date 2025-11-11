/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is now stable in Next.js 14, no need for experimental flag
  webpack: (config, { isServer }) => {
    // Suppress warnings from troika-three-text dependencies
    // These are harmless warnings from node_modules that don't affect functionality
    config.ignoreWarnings = [
      {
        module: /node_modules\/troika-three-text/,
      },
      {
        message: /does not contain a default export/,
      },
      /webgl-sdf-generator/,
      /bidi-js/,
    ];

    return config;
  },
}

module.exports = nextConfig 