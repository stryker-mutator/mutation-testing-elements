import { ReportPage } from './po/ReportPage';
import { expect } from 'chai';
import { getCurrent } from './lib/browser';
import { itShouldMatchScreenshot } from './lib/helpers';

describe('Theming', () => {
  let page: ReportPage;

  beforeEach(async () => {
    const browser = getCurrent();
    page = new ReportPage(browser);
    await page.navigateTo('install-local-example');
  });

  describe('dark theme', () => {
    beforeEach(async () => {
      await page.themeSelector.select('dark');
    });

    it('should have "dark" theme selected', async () => {
      expect(await page.themeSelector.selectedTheme()).eq('dark');
    });

    it('should have a dark background', async () => {
      expect(await page.backgroundColor()).eq('rgba(24, 24, 27, 1)');
    });

    itShouldMatchScreenshot('should match the dark theme');

    it('should remain in dark theme after a page reload', async () => {
      await getCurrent().navigate().refresh();
      expect(await page.themeSelector.selectedTheme()).eq('dark');
    });

    describe('when opening a code file', () => {
      beforeEach(async () => {
        await page.mutantView.resultTable().row('helpers.ts').navigate();
      });

      it('should show a dark code editor', async () => {
        expect(await page.mutantView.codeBackgroundColor()).eq('rgba(29, 31, 33, 1)');
      });

      itShouldMatchScreenshot('should match the dark theme');
    });
  });

  describe('light theme', () => {
    beforeEach(async () => {
      await page.themeSelector.select('light');
    });
    it('should have "light" theme selected', async () => {
      expect(await page.themeSelector.selectedTheme()).eq('light');
    });

    it('should have a white background', async () => {
      expect(await page.backgroundColor()).eq('rgba(255, 255, 255, 1)');
    });

    itShouldMatchScreenshot('should match the light theme');

    describe('when opening a code file', () => {
      beforeEach(async () => {
        await page.mutantView.resultTable().row('helpers.ts').navigate();
      });
      it('should show a light code editor', async () => {
        expect(await page.mutantView.codeBackgroundColor()).eq('rgba(246, 248, 250, 1)');
      });

      itShouldMatchScreenshot('should match the light theme');
    });
  });
});
