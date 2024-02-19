import { createServer } from 'http';
import { RealTimeReporter } from 'mutation-testing-real-time';
import type { Server } from 'http';
import type { AddressInfo } from 'net';
import { promisify } from 'util';

export class SseTestServer {
  #server: Server;
  sse: RealTimeReporter;

  constructor() {
    this.sse = new RealTimeReporter({ accessControlAllowOrigin: '*' });
    this.#server = createServer((_, res) => this.sse.add(res));
  }

  public start(): number {
    this.#server.listen(0);
    return (this.#server.address() as AddressInfo).port;
  }

  public async close() {
    if (this.#server) {
      this.sse.sendFinished();
      await promisify(this.#server.close.bind(this.#server))();
    }
  }
}
