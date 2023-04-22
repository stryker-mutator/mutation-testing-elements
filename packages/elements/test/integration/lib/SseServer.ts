import EventEmitter from 'events';
import express from 'express';
import type { ServerResponse } from 'http';
import type { AddressInfo } from 'net';

export class SseTestServer extends EventEmitter {
  #app;

  constructor() {
    super();
    this.#app = express();
    this.#app.use(this.middleware);
  }

  public on(eventType: 'client-connected' | 'client-disconnected', callback: (client: ReportingClient) => void): this {
    return super.on(eventType, callback);
  }
  public emit(eventType: 'client-connected' | 'client-disconnected', client: ReportingClient): boolean {
    return super.emit(eventType, client);
  }

  public middleware = (_: unknown, res: import('express').Response) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    const client = new ReportingClient(res);
    res.on('close', () => this.emit('client-disconnected', client));
    this.emit('client-connected', client);
  };

  public start(): Promise<number> {
    return new Promise((resolve, reject) => {
      const server = this.#app.listen();

      server.on('error', (e) => {
        console.log(e);
        reject(e);
      });
      server.on('listening', () => {
        const port = (server.address() as AddressInfo).port;
        resolve(port);
      });
    });
  }
}

export class ReportingClient {
  constructor(private readonly response: ServerResponse) {}

  public sendMutantTested(data: object) {
    this.send({ name: 'mutant-tested', data: data });
  }

  public sendFinished() {
    this.send({ name: 'finished', data: {} });
  }

  private send(event: { name: string; data: object }) {
    if (this.response === undefined) {
      return;
    }

    this.response.write(`event: ${event.name}\n`);
    this.response.write(`data: ${JSON.stringify(event.data)}\n\n`);
  }

  public disconnect() {
    this.response.destroy();
  }
}
