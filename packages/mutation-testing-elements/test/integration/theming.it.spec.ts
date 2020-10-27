/// <reference types="./typings/globals-chai" />
import { ReportPage } from './po/ReportPage';
import { expect } from 'chai';
import { getCurrent } from './lib/browser';

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
      expect(await page.backgroundColor()).eq('rgba(34, 34, 34, 1)');
    });

    it('should match the dark theme', async () => {
      await expect(await getCurrent().takeScreenshot()).to.matchScreenshot();
    });

    it('should remain in dark theme after a page reload', async () => {
      await getCurrent().navigate().refresh();
      expect(await page.themeSelector.selectedTheme()).eq('dark');
    });

    describe('when opening a code file', () => {
      beforeEach(async () => {
        await page.resultTable().row('helpers.ts').navigate();
      });

      it('should show a dark code editor', async () => {
        expect(await page.codeBackgroundColor()).eq('rgba(45, 45, 45, 1)');
      });

      it('should match the dark theme', async () => {
        await expect(await getCurrent().takeScreenshot()).to.matchScreenshot();
      });
    });
  });

  describe('light theme', () => {
    it('should have "light" theme selected', async () => {
      expect(await page.themeSelector.selectedTheme()).eq('light');
    });

    it('should have a white background', async () => {
      expect(await page.backgroundColor()).eq('rgba(255, 255, 255, 1)');
    });

    it('should match the light theme', async () => {
      await expect(await getCurrent().takeScreenshot()).to.matchScreenshot();
    });

    describe('when opening a code file', () => {
      beforeEach(async () => {
        await page.resultTable().row('helpers.ts').navigate();
      });
      it('should show a light code editor', async () => {
        expect(await page.codeBackgroundColor()).eq('rgba(245, 242, 240, 1)');
      });

      it('should match the light theme', async () => {
        await expect(await getCurrent().takeScreenshot()).to.matchScreenshot();
      });
    });
  });
});
