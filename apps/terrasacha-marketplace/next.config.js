//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');
const dotenv = require('dotenv');

// Cargar las variables de entorno antes de usarlas
dotenv.config();

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    svgr: false,
  },
  reactStrictMode: false,
  webpack: function (config, options) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: `${process.env.NEXT_PUBLIC_s3BucketName || "default-bucket"}.s3.amazonaws.com`,
      },
      {
        protocol: "https",
        hostname: "platformd9531187bef34a10abb664f2878180ae00db6-internal.s3.amazonaws.com",
        pathname: "/public/category-projects-images/**",
      },
    ],
  },
};

const plugins = [withNx];

module.exports = composePlugins(...plugins)(nextConfig);
