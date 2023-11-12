import { expect } from 'chai';
import type { MutantMarker } from './po/MutantMarker.po.js';
import { ReportPage } from './po/ReportPage.js';
import { test } from '@playwright/test';

test.describe('Unsanitized example', () => {
  let page: ReportPage;

  test.beforeEach(({ page: p }) => {
    page = new ReportPage(p);
  });

  test.describe('mutant view', () => {
    test.beforeEach(async () => {
      await page.navigateTo('unsanitized-example/#mutant/platform.ts');
    });

    test('should escape quotes in mutant ids', async () => {
      const mutantMarkers = await page.mutantView.mutantMarkers();
      let m: MutantMarker | undefined;
      for (const mutantMarker of mutantMarkers) {
        const mutantId = await mutantMarker.mutantId();
        if (mutantId === 'src/platform.ts@7:31-7:38\nStringLiteral: ""') {
          m = mutantMarker;
          break;
        }
      }
      expect(m).ok;
      await m!.toggle();
      await page.mutantView.mutantDrawer().whenHalfOpen();
    });
  });
});
