/* eslint-disable @typescript-eslint/unbound-method */
import sinon from 'sinon';
import { ServerResponse } from 'http';
import type { MutantResult } from 'mutation-testing-report-schema';

import { MutationEventSender } from '../../src/mutation-event-sender.js';
import { expect } from 'chai';

describe(MutationEventSender.name, () => {
  let responseMock: sinon.SinonStubbedInstance<ServerResponse>;
  let onCompleteStub: sinon.SinonStub<[], void>;

  beforeEach(() => {
    responseMock = sinon.createStubInstance(ServerResponse);
    onCompleteStub = sinon.stub();
  });

  it('should respond immediately with the correct HTTP SSE response', () => {
    new MutationEventSender(responseMock, onCompleteStub, { accessControlAllowOrigin: 'my-cors' });
    sinon.assert.calledOnceWithExactly(responseMock.writeHead, 200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': 'my-cors',
    });
  });

  it('should not write a corse header when no cors is provided', () => {
    new MutationEventSender(responseMock, onCompleteStub);
    sinon.assert.calledOnceWithExactly(responseMock.writeHead, 200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
  });

  it('should write correctly when sending a mutant-tested event', () => {
    const sut = new MutationEventSender(responseMock, onCompleteStub);
    const mutant: Partial<MutantResult> = {
      id: '1',
      status: 'Pending',
    };

    sut.sendMutantTested(mutant);

    sinon.assert.calledTwice(responseMock.write);
    sinon.assert.calledWith(responseMock.write, 'event: mutant-tested\n');
    sinon.assert.calledWith(responseMock.write, 'data: {"id":"1","status":"Pending"}\n\n');
  });

  it('should write correctly when sending a finished event', () => {
    const sut = new MutationEventSender(responseMock, onCompleteStub);
    sut.sendFinished();

    sinon.assert.calledTwice(responseMock.write);
    sinon.assert.calledWith(responseMock.write, 'event: finished\n');
    sinon.assert.calledWith(responseMock.write, 'data: {}\n\n');
  });

  it('should call the onComplete method when a connection closes', () => {
    new MutationEventSender(responseMock, onCompleteStub);
    responseMock.on.firstCall.args[1]();
    expect(responseMock.on.firstCall.args[0]).eq('close');
    sinon.assert.calledOnce(onCompleteStub);
  });

  it('should call the onComplete method when a connection errors', () => {
    new MutationEventSender(responseMock, onCompleteStub);
    responseMock.on.secondCall.args[1]();
    expect(responseMock.on.secondCall.args[0]).eq('error');
    sinon.assert.calledOnce(onCompleteStub);
  });

  it('should call flush on each event, when available', () => {
    const sut = new MutationEventSender(responseMock, onCompleteStub);
    responseMock.flush = sinon.stub();

    sut.sendMutantTested({ id: '1', status: 'Pending' });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    sinon.assert.calledOnce(responseMock.flush);

    sut.sendFinished();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    sinon.assert.calledTwice(responseMock.flush);
  });
});
