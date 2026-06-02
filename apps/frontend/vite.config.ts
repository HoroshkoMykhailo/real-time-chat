import viteReactPlugin from '@vitejs/plugin-react';
import { type ConfigEnv, defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';

const config = ({ mode }: ConfigEnv): ReturnType<typeof defineConfig> => {
  // import.meta.env doesn't exist at this moment
  const {
    VITE_API_PATH,
    VITE_APP_HOST,
    VITE_APP_PORT,
    VITE_APP_PROXY_SERVER_URL
  } = loadEnv(mode, process.cwd());

  const proxyTarget = VITE_APP_PROXY_SERVER_URL?.trim();

  return defineConfig({
    build: {
      outDir: 'build'
    },
    plugins: [
      viteReactPlugin(),
      svgr({
        include: '**/*.svg?react'
      })
    ],
    resolve: {
      tsconfigPaths: true
    },
    server: {
      host: VITE_APP_HOST as string,
      port: Number(VITE_APP_PORT),
      ...(proxyTarget && {
        proxy: {
          [VITE_API_PATH as string]: {
            changeOrigin: true,
            target: proxyTarget
          }
        }
      })
    }
  });
};

export default config;
