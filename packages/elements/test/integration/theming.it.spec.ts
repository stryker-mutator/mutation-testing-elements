import { expect, test } from '@playwright/test';
import colors from 'tailwindcss/colors.js';

import { itShouldMatchScreenshot } from './lib/helpers.js';
import type { FilePicker } from './po/FilePicker.po.js';
import { ReportPage } from './po/ReportPage.js';

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
      expect(await page.themeSelector.selectedTheme()).toEqual('dark');
    });

    test('should have a dark background', async () => {
      expect(await page.backgroundColor()).toEqual(colors.zinc['900']);
    });

    itShouldMatchScreenshot('should match the dark theme');

    test('should remain in dark theme after a page reload', async ({ page: p }) => {
      await p.reload();
      expect(await page.themeSelector.selectedTheme()).toEqual('dark');
    });

    test.describe('when opening a code file', () => {
      test.beforeEach(async () => {
        await page.mutantView.resultTable().row('helpers.ts').navigate();
      });

      test('should show a dark code editor', async () => {
        expect(await page.mutantView.codeBackgroundColor()).toEqual('rgb(29, 31, 33)');
      });

      itShouldMatchScreenshot('should match the dark theme');
    });

    test.describe('when opening the file picker', () => {
      let filePicker: FilePicker;
      test.beforeEach(async () => {
        filePicker = await page.breadcrumb().openFilePicker();
      });

      itShouldMatchScreenshot('should match the dark theme');

      test.describe('and typing in the search box', () => {
        test.beforeEach(async () => {
          await filePicker.search('in');
        });

        itShouldMatchScreenshot('should match the dark theme');
      });
    });
  });

  test.describe('light theme', () => {
    test.beforeEach(async () => {
      await page.themeSelector.select('light');
    });
    test('should have "light" theme selected', async () => {
      expect(await page.themeSelector.selectedTheme()).toEqual('light');
    });

    test('should have a white background', async () => {
      expect(await page.backgroundColor()).toEqual('rgb(255, 255, 255)');
    });

    itShouldMatchScreenshot('should match the light theme');

    test.describe('when opening a code file', () => {
      test.beforeEach(async () => {
        await page.mutantView.resultTable().row('helpers.ts').navigate();
      });
      test('should show a light code editor', async () => {
        expect(await page.mutantView.codeBackgroundColor()).toEqual('rgb(246, 248, 250)');
      });

      itShouldMatchScreenshot('should match the light theme');
    });

    test.describe('when opening the file picker', () => {
      let filePicker: FilePicker;
      test.beforeEach(async () => {
        filePicker = await page.breadcrumb().openFilePicker();
      });

      itShouldMatchScreenshot('should match the light theme');

      test.describe('and typing in the search box', () => {
        test.beforeEach(async () => {
          await filePicker.search('in');
        });

        itShouldMatchScreenshot('should match the light theme');
      });
    });
  });
});
