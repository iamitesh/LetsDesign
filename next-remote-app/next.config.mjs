import { NextFederationPlugin } from '@module-federation/nextjs-mf';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config, options) {
    if (!options.isServer) {
      config.plugins.push(
        new NextFederationPlugin({
          name: 'nextRemote',
          filename: 'static/chunks/remoteEntry.js',
          exposes: {
            './NextWidget': './components/NextWidget.js',
          },
          shared: {},
        })
      );
    }
    return config;
  },
};

export default nextConfig;
