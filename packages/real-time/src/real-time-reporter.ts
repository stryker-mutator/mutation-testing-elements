/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ServerResponse } from 'http';
import { EventEmitter } from 'events';
import type { MutantResult } from 'mutation-testing-report-schema';
import { MutationEventSender } from './mutation-event-sender.js';
import type { RealTimeOptions } from './real-time-options.js';

/**
 * A class that can send mutation test events to listening clients.
 * You can upgrade an http [ServerResponse](https://nodejs.org/api/http.html#class-httpserverresponse) to become a real-time responder using the `add` method. After that, you can send events using the `send` method.
 * Finally, you can decide to send a finished event using the `sendFinished` method.
 */
export class RealTimeReporter extends EventEmitter {
  #options: RealTimeOptions;
  #mutationEventSenders = new Set<MutationEventSender>();

  constructor(options: RealTimeOptions = {}) {
    super();
    this.#options = options;
  }

  addListener(eventName: 'client-connected', listener: (client: MutationEventSender) => void): this;
  addListener(eventName: 'client-disconnected', listener: (client: MutationEventSender) => void): this;
  override addListener(eventName: string | symbol, listener: (...args: any[]) => void): this {
    return super.addListener(eventName, listener);
  }
  on(eventName: 'client-connected', listener: (client: MutationEventSender) => void): this;
  on(eventName: 'client-disconnected', listener: (client: MutationEventSender) => void): this;
  override on(eventName: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(eventName, listener);
  }

  once(eventName: 'client-connected', listener: (client: MutationEventSender) => void): this;
  once(eventName: 'client-disconnected', listener: (client: MutationEventSender) => void): this;
  override once(eventName: string | symbol, listener: (...args: any[]) => void): this {
    return super.once(eventName, listener);
  }

  emit(eventName: 'client-connected', client: MutationEventSender): boolean;
  emit(eventName: 'client-disconnected', client: MutationEventSender): boolean;
  override emit(eventName: string | symbol, ...args: any[]): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return super.emit(eventName, ...args);
  }

  public add(res: ServerResponse) {
    const client: MutationEventSender = new MutationEventSender(
      res,
      () => {
        this.#mutationEventSenders.delete(client);
        this.emit('client-disconnected', client);
      },
      this.#options,
    );
    this.#mutationEventSenders.add(client);
    this.emit('client-connected', client);
  }

  public sendMutantTested(mutant: Partial<MutantResult>): void {
    this.#mutationEventSenders.forEach((sender) => {
      sender.sendMutantTested(mutant);
    });
  }

  public sendFinished(): void {
    this.#mutationEventSenders.forEach((sender) => {
      sender.sendFinished();
    });
  }

  public get senderCount() {
    return this.#mutationEventSenders.size;
  }
}
