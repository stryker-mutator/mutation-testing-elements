import { expect } from 'chai';
import { getCurrent } from './lib/browser';
import { MutantMarker } from './po/MutantMarker.po';
import { ReportPage } from './po/ReportPage';

describe('Unsanitized example', () => {
  let page: ReportPage;

  beforeEach(() => {
    page = new ReportPage(getCurrent());
  });

  describe('mutant view', () => {
    beforeEach(async () => {
      await page.navigateTo('unsanitized-example/#mutant/platform.ts');
    });

    it('should escape quotes in mutant ids', async () => {
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
      expect(await page.mutantView.mutantDrawer().whenHalfOpen()).eq(true);
    });
  });
});
