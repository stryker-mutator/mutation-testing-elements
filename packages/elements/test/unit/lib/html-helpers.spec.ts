import { escapeHtml, getContextClassForStatus, toAbsoluteUrl } from '../../../src/lib/html-helpers.js';
import type { MutantStatus } from 'mutation-testing-report-schema/api';

describe(getContextClassForStatus.name, () => {
  function actArrangeAssert(expected: string, input: MutantStatus) {
    it(`should should show "${expected}" for "${input}"`, () => {
      expect(getContextClassForStatus(input)).eq(expected);
    });
  }
  actArrangeAssert('success', 'Killed');
  actArrangeAssert('danger', 'Survived');
  actArrangeAssert('caution', 'NoCoverage');
  actArrangeAssert('warning', 'Timeout');
  actArrangeAssert('secondary', 'CompileError');
  actArrangeAssert('secondary', 'RuntimeError');
  actArrangeAssert('secondary', 'Ignored');
});

describe(escapeHtml.name, () => {
  function actArrangeAssert(input: string, expectedOutput: string) {
    it(`should translate ${input} to ${expectedOutput}`, () => {
      expect(escapeHtml(input)).eq(expectedOutput);
    });
  }

  actArrangeAssert('foo&bar', 'foo&amp;bar');
  actArrangeAssert('foo<bar', 'foo&lt;bar');
  actArrangeAssert('foo>bar', 'foo&gt;bar');
  actArrangeAssert('foo"bar', 'foo&quot;bar');
  actArrangeAssert("foo'bar", 'foo&#039;bar');
});

describe(toAbsoluteUrl.name, () => {
  it('should make a fragment absolute', () => {
    const actual = toAbsoluteUrl('foo');
    expect(actual).eq(expectedUrl());

    function expectedUrl() {
      const currentUrl = window.location.href;
      if (currentUrl.endsWith('#')) {
        return `${currentUrl}foo`;
      } else {
        return `${currentUrl}#foo`;
      }
    }
  });
});
