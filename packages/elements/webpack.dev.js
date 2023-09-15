const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

const TOTAL_MUTANT_COUNT = 15;
const { SseTestServer } = require('./dist-test/integration/lib/SseServer.js');
const clientMap = new Map();
/** @type {import("./test/integration/lib/SseServer.ts").SseTestServer} */
const server = new SseTestServer();
const statuses = ['Survived', 'Killed', 'Timeout', 'CompileError', 'RuntimeError', 'NoCoverage', 'Ignored'];
server.on('client-connected', (client) => {
  let id = 0;
  const interval = setInterval(() => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    client.sendMutantTested({ id: String(id), status: status, coveredBy: ['test_1'] });
    id++;

    if (id > TOTAL_MUTANT_COUNT) {
      clearInterval(interval);
      client.sendFinished();
      client.disconnect();
    }
  }, 1000);
  clientMap.set(client, interval);
});
server.on('client-disconnected', (client) => {
  clearInterval(clientMap.get(client));
});

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: ['./testResources', '.'],
    setupMiddlewares: (middlewares) => {
      middlewares.unshift({
        name: 'sse-middleware',
        path: '/realtime-reporting-example/sse',
        middleware: server.middleware,
      });

      return middlewares;
    },
  },
});
