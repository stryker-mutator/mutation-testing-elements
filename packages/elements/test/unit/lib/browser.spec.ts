import { isLocalStorageAvailable } from '../../../src/lib/browser.js';
import type { SpyInstance } from 'vitest';

describe(isLocalStorageAvailable.name, () => {
  let setItemStub: SpyInstance<Parameters<Storage['setItem']>, ReturnType<Storage['setItem']>>;
  let removeItemStub: SpyInstance<Parameters<Storage['removeItem']>, ReturnType<Storage['removeItem']>>;

  beforeEach(() => {
    setItemStub = vi.spyOn(Storage.prototype, 'setItem');
    removeItemStub = vi.spyOn(Storage.prototype, 'removeItem');
  });

  it(`should be false if setItem throws`, () => {
    setItemStub.mockImplementation(() => {
      throw new Error('Quota exceeded');
    });

    expect(isLocalStorageAvailable()).to.be.false;
  });

  it(`should be false if removeItem throws`, () => {
    removeItemStub.mockImplementation(() => {
      throw new Error('Quota exceeded');
    });

    expect(isLocalStorageAvailable()).to.be.false;
  });

  it(`should be false if localStorage is undefined`, () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => undefined as unknown as Storage);

    expect(isLocalStorageAvailable()).to.be.false;
  });

  it('should be true if localStorage works', () => {
    expect(isLocalStorageAvailable()).to.be.true;
  });
});
