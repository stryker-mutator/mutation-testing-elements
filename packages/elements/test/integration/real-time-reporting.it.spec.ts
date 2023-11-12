import { expect, test } from '@playwright/test';
import type { ReportingClient } from './lib/SseServer.js';
import { SseTestServer } from './lib/SseServer.js';
import { ReportPage } from './po/ReportPage.js';

test.describe('real-time reporting', () => {
  const server: SseTestServer = new SseTestServer();
  const defaultEvent = { id: '0', status: 'Killed' };

  let port: number;
  let page: ReportPage;
  let client: ReportingClient;

  test.beforeEach(async ({ page: p }) => {
    port = await server.start();
    page = new ReportPage(p);
  });

  test.afterEach(async () => {
    await server.close();
  });

  test.describe('when navigating to the overview page', () => {
    test('should update the mutation testing metrics', async () => {
      server.on('client-connected', (c) => (client = c));

      await arrangeNavigate();
      client.sendMutantTested(defaultEvent);
      client.sendMutantTested({ id: '1', status: 'Survived' });
      client.sendFinished();

      const allFilesRow = page.mutantView.resultTable().row('All files');
      const attributesRow = page.mutantView.resultTable().row('Attributes');
      const wrappitContextRow = page.mutantView.resultTable().row('WrappitContext.cs');

      await expect(allFilesRow.mutationScore()).toHaveText('50.00');
      await expect(allFilesRow.mutationScore()).toHaveText('50.00');
      await expect(attributesRow.mutationScore()).toHaveText('100.00');
      await expect(wrappitContextRow.mutationScore()).toHaveText('0.00');
    });

    test('should show a progress-bar when real-time reporting is enabled', async () => {
      await arrangeNavigate();

      await expect(page.realTimeProgressBar.progressBar).toBeVisible();
    });

    test('should show a small progress-bar when scrolling down the page', async () => {
      await arrangeNavigate();

      const progressBar = page.realTimeProgressBar;
      expect(await progressBar.smallProgressBarVisible()).toEqual(false);
      await page.mutantView.resultTable().row('WrappitContext.cs').navigate();
      await page.scrollDown();
      await expect.poll(async () => await progressBar.smallProgressBarVisible()).toEqual(true);
    });

    test('should update the progress-bar when the report is updated', async () => {
      server.on('client-connected', (c) => (client = c));

      await arrangeNavigate();
      expect(await page.realTimeProgressBar.progressBarWidth()).toEqual(0);
      await expect(page.realTimeProgressBar.killedCount()).not.toBeVisible();
      client.sendMutantTested(defaultEvent);

      await expect.poll(async () => await page.realTimeProgressBar.progressBarWidth()).not.toEqual(0);
      await expect(page.realTimeProgressBar.killedCount()).toHaveText('1');
    });
  });

  async function arrangeNavigate() {
    await page.navigateTo(`realtime-reporting-example/?port=${port}`);
  }

  test.describe('when navigating to a file with 1 mutant', () => {
    test('should update the state of a mutant', async () => {
      server.on('client-connected', (c) => (client = c));
      await page.navigateTo(`realtime-reporting-example/?port=${port}#mutant/Attributes/HandleAttribute.cs/`);

      expect(await page.mutantView.mutantDots()).toHaveLength(1);
      const mutantPending = page.mutantView.mutantMarker('0');
      expect(await mutantPending.underlineIsVisible()).toEqual(true);

      client.sendMutantTested(defaultEvent);
      client.sendFinished();
      const filter = page.mutantView.stateFilter();
      await filter.state('Killed').waitForVisible();
      expect(await page.mutantView.mutantDots()).toHaveLength(0);
      await filter.state('Killed').click();
      expect(await page.mutantView.mutantDots()).toHaveLength(1);
    });

    test('should keep the drawer open if it has been selected while an update comes through', async () => {
      server.on('client-connected', (c) => (client = c));
      await page.navigateTo(`realtime-reporting-example/?port=${port}#mutant/Attributes/HandleAttribute.cs/`);

      const mutant = page.mutantView.mutantDot('0');
      const drawer = page.mutantView.mutantDrawer();
      await mutant.toggle();
      await drawer.whenHalfOpen();

      client.sendMutantTested(defaultEvent);

      await drawer.whenHalfOpen();
    });
  });
});
