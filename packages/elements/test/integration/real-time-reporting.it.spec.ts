import { expect, test } from '@playwright/test';
import { SseTestServer } from './lib/SseServer.js';
import { ReportPage } from './po/ReportPage.js';
import type { MutantResult } from 'mutation-testing-report-schema';

test.describe.only('real-time reporting', () => {
  let server: SseTestServer;
  const defaultEvent: Readonly<Partial<MutantResult>> = Object.freeze({ id: '0', status: 'Killed' });

  let port: number;
  let page: ReportPage;

  test.beforeEach(({ page: p }) => {
    server = new SseTestServer();
    port = server.start();
    page = new ReportPage(p);
  });

  test.afterEach(async () => {
    await server.close();
  });

  test.describe('when navigating to the overview page', () => {
    test('should update the mutation testing metrics', async () => {
      await arrangeNavigate();
      await clientConnected();
      server.sse.sendMutantTested(defaultEvent);
      server.sse.sendMutantTested({ id: '1', status: 'Survived' });
      server.sse.sendFinished();

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
      await arrangeNavigate();
      await clientConnected();

      expect(await page.realTimeProgressBar.progressBarWidth()).toEqual(0);
      await expect(page.realTimeProgressBar.killedCount()).not.toBeVisible();
      server.sse.sendMutantTested(defaultEvent);

      await expect.poll(async () => await page.realTimeProgressBar.progressBarWidth()).not.toEqual(0);
      await expect(page.realTimeProgressBar.killedCount()).toHaveText('1');
    });
  });

  async function arrangeNavigate() {
    await page.navigateTo(`realtime-reporting-example/?port=${port}`);
  }

  async function clientConnected() {
    return new Promise<void>((resolve) => {
      if (server.sse.senderCount > 0) {
        resolve();
      } else {
        server.sse.once('client-connected', () => resolve());
      }
    });
  }

  test.describe('when navigating to a file with 1 mutant', () => {
    test('should update the state of a mutant', async () => {
      await page.navigateTo(`realtime-reporting-example/?port=${port}#mutant/Attributes/HandleAttribute.cs/`);
      await clientConnected();

      expect(await page.mutantView.mutantDots()).toHaveLength(1);
      const mutantPending = page.mutantView.mutantMarker('0');
      expect(await mutantPending.underlineIsVisible()).toEqual(true);

      server.sse.sendMutantTested(defaultEvent);
      server.sse.sendFinished();
      const filter = page.mutantView.stateFilter();
      await filter.state('Killed').waitForVisible();
      expect(await page.mutantView.mutantDots()).toHaveLength(0);
      await filter.state('Killed').click();
      expect(await page.mutantView.mutantDots()).toHaveLength(1);
    });

    test('should keep the drawer open if it has been selected while an update comes through', async () => {
      await page.navigateTo(`realtime-reporting-example/?port=${port}#mutant/Attributes/HandleAttribute.cs/`);
      await clientConnected();

      const mutant = page.mutantView.mutantDot('0');
      const drawer = page.mutantView.mutantDrawer();
      await mutant.toggle();
      await drawer.whenHalfOpen();

      server.sse.sendMutantTested(defaultEvent);

      await drawer.whenHalfOpen();
    });
  });
});
