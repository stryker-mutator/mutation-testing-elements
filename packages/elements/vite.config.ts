/// <reference types="vitest" />

import type { UserConfig } from 'vitest/config';
import { defineConfig } from 'vitest/config';
import type { ReportingClient } from './test/integration/lib/SseServer.js';
import { SseTestServer } from './test/integration/lib/SseServer.js';

export default defineConfig(async ({ mode }) => {
  let server: SseTestServer | undefined;

  if (mode === 'development') {
    const TOTAL_MUTANT_COUNT = 15;
    const clientMap = new Map<ReportingClient, NodeJS.Timeout>();
    server = new SseTestServer();
    server?.on('client-connected', (client) => {
      let id = 0;
      const interval = setInterval(() => {
        client.sendMutantTested({ id: String(id), status: 'Killed', coveredBy: ['test_1'] });
        id++;

        if (id > TOTAL_MUTANT_COUNT) {
          clearInterval(interval);
          client.sendFinished();
          client.disconnect();
        }
      }, 1000);
      clientMap.set(client, interval);
    });
    server?.on('client-disconnected', (client) => {
      clearInterval(clientMap.get(client));
    });
  }

  return {
    optimizeDeps: {
      include: ['mutation-testing-report-schema', 'mutation-testing-metrics'],
    },
    resolve: {
      alias: {
        '/mutation-test-elements.js': '/src/index.ts',
      },
    },
    server: {
      proxy: server
        ? {
            '/testResources/realtime-reporting-example/sse': {
              target: `http://localhost:${await server.start()}/realtime-reporting-example/sse`,
              bypass: server.middleware,
            },
          }
        : undefined,
      open: process.env.CI ? undefined : '/testResources/',
    },
    build: {
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
        formats: ['iife', 'cjs', 'es'],
      },
    },
    test: {
      onConsoleLog(log) {
        // ignore the dev mode warning in test logs
        if (log.includes('Lit is in dev mode.')) return false;
        if (log.includes('Multiple versions of Lit loaded.')) return;
        return;
      },
      ...(process.env.CI ? { maxConcurrency: 1 } : {}),
      setupFiles: ['./test/unit/setup.ts'],
      restoreMocks: true,
      globals: true,
      include: ['test/unit/**/*.spec.ts'],
      browser: {
        name: 'chromium',
        enabled: true,
        provider: 'playwright',
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        headless: !!(process.env.CI || process.env.HEADLESS),
      },
    },
  } satisfies UserConfig;
});
