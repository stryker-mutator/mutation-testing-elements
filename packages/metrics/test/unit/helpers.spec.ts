import { expect } from 'chai';
import { normalizeFileNames } from '../../src/index.js';

describe(normalizeFileNames.name, () => {
  it('should replace \\ with /', () => {
    const input: Record<string, number> = {
      'src\\components\\foo.js': 4,
      'test\\components\\foo.spec.js': 5,
    };

    const out = normalizeFileNames(input);

    const expected: Record<string, number> = {
      'src/components/foo.js': 4,
      'test/components/foo.spec.js': 5,
    };
    expect(out).deep.eq(expected);
  });

  it('should remove common root path', () => {
    const input: Record<string, number> = {
      'c:\\tmp\\repo\\src\\components\\foo.js': 4,
      'c:\\tmp\\repo\\test\\components\\foo.spec.js': 5,
    };

    const out = normalizeFileNames(input);

    const expected: Record<string, number> = {
      'src/components/foo.js': 4,
      'test/components/foo.spec.js': 5,
    };
    expect(out).deep.eq(expected);
  });
});
