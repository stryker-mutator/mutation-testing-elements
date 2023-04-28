import EventEmitter from 'events';
import express from 'express';
import type { Server, ServerResponse } from 'http';
import type { AddressInfo } from 'net';
import { promisify } from 'util';

export class SseTestServer extends EventEmitter {
  #app;
  #server?: Server;
  #clients = new Set<ReportingClient>();

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
    this.#clients.add(client);
    res.on('close', () => {
      this.emit('client-disconnected', client);
      this.#clients.delete(client);
    });
    this.emit('client-connected', client);
  };

  public start(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.#server = this.#app.listen();

      this.#server.on('error', (e) => {
        console.log(e);
        reject(e);
      });
      this.#server.on('listening', () => {
        const port = (this.#server!.address() as AddressInfo).port;
        resolve(port);
      });
    });
  }

  public async close() {
    if (this.#server) {
      this.#clients.forEach((client) => {
        client.disconnect();
        this.#clients.delete(client);
      });
      await promisify(this.#server.close.bind(this.#server))();
    }
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
