/// <reference types="vitest" />

import tailwindcss from '@tailwindcss/vite';
import browserslist from 'browserslist';
import browserslistToEsbuild from 'browserslist-to-esbuild';
import { browserslistToTargets, Features } from 'lightningcss';
import { type MutationEventSender, RealTimeReporter } from 'mutation-testing-real-time';
import { type Plugin } from 'vite';
import { defineConfig, type ViteUserConfig } from 'vitest/config';

const esbuildOptions = {
  tsconfigRaw: {
    compilerOptions: {
      experimentalDecorators: true,
    },
  },
};

export default defineConfig(
  ({ mode }) =>
    ({
      optimizeDeps: {
        esbuildOptions,
        include: ['mutation-testing-report-schema', 'mutation-testing-metrics'],
      },
      resolve: {
        alias: {
          '/mutation-test-elements.js': '/src/index.ts',
        },
      },
      plugins: [tailwindcss(), realTimeResponderPlugin()],
      server: {
        open: process.env.CI ? undefined : '/testResources/',
      },
      esbuild: esbuildOptions,
      css: {
        transformer: 'lightningcss',
        lightningcss: {
          // Disable Oklab color transformation for tests, as we assert on color values
          exclude: mode === 'test' ? Features.OklabColors : 0,
          targets: browserslistToTargets(browserslist()),
        },
      },
      build: {
        cssMinify: 'lightningcss',
        emptyOutDir: !process.env.IIFE_BUILD,
        rollupOptions: {
          // For library usage, we want to externalize lit. When included as a script on the page we want to bundle it.
          external: process.env.IIFE_BUILD ? undefined : [/^lit/],
        },
        target: browserslistToEsbuild(),
        lib: {
          entry: 'src/index.ts',
          name: 'MutationTestElements',
          fileName(format, entryName) {
            switch (format) {
              case 'iife':
                return `mutation-test-elements.js`;
              case 'cjs':
                return `${entryName}.cjs`;
              case 'es':
                return `${entryName}.js`;
              default:
                throw new Error(`Unexpected format: ${format}`);
            }
          },
          formats: process.env.IIFE_BUILD ? ['iife'] : ['cjs', 'es'],
        },
      },
      test: {
        onConsoleLog(log) {
          // ignore the dev mode warning in test logs
          if (log.includes('Lit is in dev mode.')) return false;
          if (log.includes('Multiple versions of Lit loaded.')) return;
          return;
        },
        ...(process.env.CI ? { retry: 2 } : {}),
        setupFiles: ['./test/unit/setup.ts'],
        restoreMocks: true,
        unstubGlobals: true,
        globals: true,
        include: ['test/unit/**/*.spec.ts'],
        browser: {
          enabled: true,
          provider: 'playwright',
          name: 'chromium',
          headless: Boolean(process.env.CI || process.env.HEADLESS),
          instances: [
            {
              name: 'chromium',
              browser: 'chromium',
              headless: Boolean(process.env.CI || process.env.HEADLESS),
            },
          ],
        },
      },
    }) satisfies ViteUserConfig,
);

function realTimeResponderPlugin(): Plugin {
  const TOTAL_MUTANT_COUNT = 15;
  const clientMap = new Map<MutationEventSender, NodeJS.Timeout>();
  const realTimeResponder = new RealTimeReporter();
  realTimeResponder.on('client-connected', (client) => {
    let id = 0;
    const interval = setInterval(() => {
      client.sendMutantTested({ id: String(id), status: 'Killed', coveredBy: ['test_1'] });
      id++;

      if (id > TOTAL_MUTANT_COUNT) {
        clearInterval(interval);
        client.sendFinished();
      }
    }, 1000);
    clientMap.set(client, interval);
  });
  realTimeResponder.on('client-disconnected', (client) => {
    clearInterval(clientMap.get(client));
  });
  return {
    name: 'real-time-responder',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/testResources/realtime-reporting-example/sse') {
          realTimeResponder.add(res);
        } else {
          next();
        }
      });
    },
  };
}
