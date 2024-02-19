import { expect } from 'chai';
import type { AddressInfo } from 'net';
import { firstValueFrom, lastValueFrom, toArray } from 'rxjs';
import { RealTimeReporter } from '../../src/real-time-reporter.js';
import { type Server, createServer } from 'http';
import type { MutantResult } from 'mutation-testing-report-schema';
import { MutantEventSource } from './mutant-event-source.js';
import type { RealTimeOptions } from '../../src/real-time-options.js';

describe(`${RealTimeReporter.name} integration`, () => {
  let server: Server;
  let sut: RealTimeReporter;
  let port: number;

  function arrangeMutationEventServer(options: RealTimeOptions = {}) {
    sut = new RealTimeReporter(options);
    server = createServer((_, res) => {
      sut.add(res);
    });
    server.listen();
    port = (server.address() as AddressInfo).port;
  }

  afterEach(() => {
    return new Promise<void>((res) => server.close(() => res()));
  });
  describe('when started', () => {
    it('should correspond with correct Access-Control-Allow-Origin header', async () => {
      // Arrange
      arrangeMutationEventServer({ accessControlAllowOrigin: 'some-origin' });

      // Act
      const abort = new AbortController();
      const response = await fetch(`http://localhost:${port}`, { method: 'GET', signal: abort.signal });
      const actual = response.headers.get('Access-Control-Allow-Origin');

      // Assert
      abort.abort();
      expect(actual).eq('some-origin');
    });
    it('should correspond without "Access-Control-Allow-Origin" header if non was configured', async () => {
      // Arrange
      arrangeMutationEventServer();

      // Act
      const abort = new AbortController();
      const response = await fetch(`http://localhost:${port}`, { method: 'GET', signal: abort.signal });
      abort.abort();

      // Assert
      expect(response.headers.has('Access-Control-Allow-Origin')).false;
    });
  });

  describe('when receiving messages', () => {
    let allClients: MutantEventSource[];

    beforeEach(() => {
      allClients = [];
      arrangeMutationEventServer({ accessControlAllowOrigin: '*' });
    });

    afterEach(() => {
      allClients.forEach((client) => client.close());
    });

    it('should send events to the client', async () => {
      // Arrange
      const [client] = await createMutantEventSources();
      const expectedMutantResult: Partial<MutantResult> = { id: '1', status: 'Pending' };

      // Act
      sut.sendMutantTested(expectedMutantResult);

      // Assert
      const actualMutantResult = await firstValueFrom(client.mutantResult$);
      expect(actualMutantResult).deep.eq(expectedMutantResult);
    });

    it('should allow multiple clients to connect', async () => {
      // Arrange
      const [client1, client2] = await createMutantEventSources(2);
      const expectedMutantResult: Partial<MutantResult> = { id: '1', status: 'Pending' };

      // Act
      sut.sendMutantTested(expectedMutantResult);

      // Assert
      const [actualMutantResult1, actualMutantResult2] = await Promise.all([
        firstValueFrom(client1.mutantResult$),
        firstValueFrom(client2.mutantResult$),
      ]);
      expect(actualMutantResult1).deep.eq(expectedMutantResult);
      expect(actualMutantResult2).deep.eq(expectedMutantResult);
    });

    it('should allow a client to connect later', async () => {
      // Arrange
      const [client] = await createMutantEventSources();
      const firstMutantResult: Partial<MutantResult> = { id: '1', status: 'Pending' };
      const secondMutantResult: Partial<MutantResult> = { id: '2', status: 'Killed' };
      const firstClientMutant$ = lastValueFrom(client.mutantResult$.pipe(toArray()));
      sut.sendMutantTested(firstMutantResult);

      // Act
      const [client2] = await createMutantEventSources();
      const secondClientMutant$ = lastValueFrom(client2.mutantResult$.pipe(toArray()));
      sut.sendMutantTested(secondMutantResult);
      await firstValueFrom(client2.mutantResult$); // Wait for the second client to receive the last mutant

      // Assert
      client.close();
      client2.close();
      const firstClientMutantResults = await firstClientMutant$;
      const secondClientMutantResults = await secondClientMutant$;
      expect(firstClientMutantResults).deep.eq([firstMutantResult, secondMutantResult]);
      expect(secondClientMutantResults).deep.eq([secondMutantResult]);
    });

    function waitForSenders(count = 1) {
      return new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          if (sut.senderCount === count) {
            clearInterval(interval);
            resolve();
          }
        }, 10);
      });
    }
    async function createMutantEventSources(n = 1): Promise<MutantEventSource[]> {
      const clients = new Array(n).fill(0).map(() => new MutantEventSource(port));
      allClients.push(...clients);
      await waitForSenders(allClients.length);
      return clients;
    }
  });
});
