import { lastValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

import { locationChange$ } from '../../../src/lib/router.js';

describe('locationChange$', () => {
  afterEach(() => {
    window.location.hash = '';
  });

  it('should emit a value as soon as it is subscribed', async () => {
    const actual = await lastValueFrom(locationChange$.pipe(take(1)));
    expect(actual).deep.eq([]);
  });

  it('should respond to the "hashchange" event', async () => {
    const sut = lastValueFrom(locationChange$.pipe(take(2)));
    window.location.hash = 'foo';
    const actualValue = await sut;
    expect(actualValue).deep.eq(['foo']);
  });

  it('should split on "/", and filter out empty parts', async () => {
    const sut = lastValueFrom(locationChange$.pipe(take(2)));
    window.location.hash = 'foo//bar';
    const actualValue = await sut;
    expect(actualValue).deep.eq(['foo', 'bar']);
  });

  it('should url decode the path components before emitting a value', async () => {
    const sut = lastValueFrom(locationChange$.pipe(take(2)));
    window.location.hash = 'foo/%60bar%60.js';
    const actualValue = await sut;
    expect(actualValue).deep.eq(['foo', '`bar`.js']);
  });
});
