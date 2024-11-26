/* eslint-disable @typescript-eslint/unbound-method */
import { expect } from 'chai';
import { IncomingMessage, ServerResponse } from 'http';
import type { MutantResult } from 'mutation-testing-report-schema';
import { Socket } from 'net';
import sinon from 'sinon';

import type { RealTimeOptions } from '../../src/real-time-options.js';
import { RealTimeReporter } from '../../src/real-time-reporter.js';

describe(RealTimeReporter.name, () => {
  const data: Partial<MutantResult> = {
    id: '1',
    status: 'Killed',
    location: {
      start: { line: 1, column: 2 },
      end: { line: 1, column: 2 },
    },
    mutatorName: 'block statement',
  };
  let options: RealTimeOptions;
  let responseMock: sinon.SinonStubbedInstance<ServerResponse>;
  let responseMock2: sinon.SinonStubbedInstance<ServerResponse>;
  let sut: RealTimeReporter;

  beforeEach(() => {
    options = { accessControlAllowOrigin: '' };
    responseMock = sinon.createStubInstance(ServerResponse);
    responseMock2 = sinon.createStubInstance(ServerResponse);
    sut = new RealTimeReporter(options);
  });

  it('should send mutant-tested event', () => {
    sut.add(responseMock);
    sut.sendMutantTested(data);

    assertWrite('event: mutant-tested\n');
    assertWrite(`data: ${JSON.stringify(data)}\n\n`);
  });

  it('should send mutant-tested event multiple times', () => {
    sut.add(responseMock);
    sut.add(responseMock2);
    sut.sendMutantTested(data);

    assertWrite('event: mutant-tested\n', responseMock.write);
    assertWrite('event: mutant-tested\n', responseMock2.write);
  });

  it('should send finished multiple times', () => {
    sut.add(responseMock);
    sut.add(responseMock2);
    sut.sendFinished();

    sinon.assert.calledTwice(responseMock.write);
    sinon.assert.calledTwice(responseMock2.write);
  });

  it('should remove response from set when connection closes', () => {
    const response = new ServerResponse(new IncomingMessage(new Socket()));
    sut.add(response);
    expect(sut.senderCount).to.eq(1);

    response.emit('close');

    expect(sut.senderCount).to.eq(0);
  });
  function assertWrite(expected: string, stub = responseMock.write) {
    sinon.assert.calledWithExactly(stub as unknown as sinon.SinonSpy<[string], void>, expected);
  }
});
