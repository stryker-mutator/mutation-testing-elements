import { ReportPage } from './po/ReportPage.js';
import { expect } from 'chai';
import { itShouldMatchScreenshot } from './lib/helpers.js';
import { test } from '@playwright/test';

test.describe('Theming', () => {
  let page: ReportPage;

  test.beforeEach(async ({ page: p }) => {
    page = new ReportPage(p);
    await page.navigateTo('install-local-example/');
  });

  test.describe('dark theme', () => {
    test.beforeEach(async () => {
      await page.themeSelector.select('dark');
    });

    test('should have "dark" theme selected', async () => {
      expect(await page.themeSelector.selectedTheme()).eq('dark');
    });

    test('should have a dark background', async () => {
      expect(await page.backgroundColor()).eq('rgb(24, 24, 27)');
    });

    itShouldMatchScreenshot('should match the dark theme');

    test('should remain in dark theme after a page reload', async ({ page: p }) => {
      await p.reload();
      expect(await page.themeSelector.selectedTheme()).eq('dark');
    });

    test.describe('when opening a code file', () => {
      test.beforeEach(async () => {
        await page.mutantView.resultTable().row('helpers.ts').navigate();
      });

      test('should show a dark code editor', async () => {
        expect(await page.mutantView.codeBackgroundColor()).eq('rgb(29, 31, 33)');
      });

      itShouldMatchScreenshot('should match the dark theme');
    });
  });

  test.describe('light theme', () => {
    test.beforeEach(async () => {
      await page.themeSelector.select('light');
    });
    test('should have "light" theme selected', async () => {
      expect(await page.themeSelector.selectedTheme()).eq('light');
    });

    test('should have a white background', async () => {
      expect(await page.backgroundColor()).eq('rgb(255, 255, 255)');
    });

    itShouldMatchScreenshot('should match the light theme');

    test.describe('when opening a code file', () => {
      test.beforeEach(async () => {
        await page.mutantView.resultTable().row('helpers.ts').navigate();
      });
      test('should show a light code editor', async () => {
        expect(await page.mutantView.codeBackgroundColor()).eq('rgb(246, 248, 250)');
      });

      itShouldMatchScreenshot('should match the light theme');
    });
  });
});
