import { isLocalStorageAvailable } from '../../../src/lib/browser';
import sinon from 'sinon';
import { expect } from 'chai';

describe(isLocalStorageAvailable.name, () => {
  let setItemStub: sinon.SinonStub<Parameters<Storage['setItem']>, ReturnType<Storage['setItem']>>;
  let removeItemStub: sinon.SinonStub<Parameters<Storage['removeItem']>, ReturnType<Storage['removeItem']>>;

  beforeEach(() => {
    setItemStub = sinon.stub(localStorage, 'setItem');
    removeItemStub = sinon.stub(localStorage, 'removeItem');
  });

  it(`should be false if setItem throws`, () => {
    setItemStub.throws(new Error('Quota exceeded'));

    expect(isLocalStorageAvailable()).to.be.false;
  });

  it(`should be false if removeItem throws`, () => {
    removeItemStub.throws(new Error('Quota exceeded'));

    expect(isLocalStorageAvailable()).to.be.false;
  });

  it(`should be false if localStorage is undefined`, () => {
    sinon.replaceGetter(window, 'localStorage', () => undefined as unknown as Storage);

    expect(isLocalStorageAvailable()).to.be.false;
  });

  it('should be true if localStorage works', () => {
    expect(isLocalStorageAvailable()).to.be.true;
  });
});
