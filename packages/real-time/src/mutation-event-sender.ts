import type { MutantResult } from 'mutation-testing-report-schema';
import type { ServerResponse } from 'http';
import { EventEmitter } from 'node:events';
import type { RealTimeOptions } from './real-time-options.js';

export class MutationEventSender extends EventEmitter {
  #response: ServerResponse;

  constructor(res: ServerResponse, onFinish: () => void, { accessControlAllowOrigin }: RealTimeOptions = {}) {
    super();

    this.#response = res;
    const headers: Record<string, string> = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    };
    if (accessControlAllowOrigin) {
      headers['Access-Control-Allow-Origin'] = accessControlAllowOrigin;
    }
    this.#response.writeHead(200, headers);
    this.#response.flushHeaders();
    this.#response.on('close', onFinish);
    this.#response.on('error', onFinish);
  }

  public sendMutantTested(mutant: Partial<MutantResult>): void {
    this.#send('mutant-tested', mutant);
  }

  public sendFinished(): void {
    this.#send('finished', {});
  }

  #send<T>(event: string, payload: T): void {
    this.#response.write(`event: ${event}\n`);
    this.#response.write(`data: ${JSON.stringify(payload)}\n\n`);
  }
}
