import { expect } from 'chai';
import { SseTestServer } from './lib/SseServer';
import { getCurrent } from './lib/browser';
import { ReportPage } from './po/ReportPage';
import { ReportingClient } from './lib/SseServer';
import { MutantStatus } from 'mutation-testing-report-schema';
import { waitUntil } from './lib/helpers';

describe('realtime reporting', () => {
  const server: SseTestServer = new SseTestServer();
  const defaultEvent = { id: '0', status: 'Killed' };

  let port: number;
  let page: ReportPage;
  let client: ReportingClient;

  beforeEach(async () => {
    port = await server.start();
    page = new ReportPage(getCurrent());
  });

  afterEach(async () => {
    await server.close();
  });

  describe('when navigating to the overview page', () => {
    it('should update the mutation testing metrics', async () => {
      server.on('client-connected', (c) => (client = c));

      await page.navigateTo(`realtime-reporting-example/?port=${port}`);
      await page.whenFileReportLoaded();
      client.sendMutantTested(defaultEvent);
      client.sendMutantTested({ id: '1', status: 'Survived' });

      const allFilesRow = page.mutantView.resultTable().row('All files');
      const attributesRow = page.mutantView.resultTable().row('Attributes');
      const wrappitContextRow = page.mutantView.resultTable().row('WrappitContext.cs');

      expect(await allFilesRow.mutationScore()).to.eq('50.00');
      expect(await attributesRow.mutationScore()).to.eq('100.00');
      expect(await wrappitContextRow.mutationScore()).to.eq('0.00');
    });
  });

  describe('when navigating to a file with 1 mutant', () => {
    it('should update the state of a mutant', async () => {
      server.on('client-connected', (c) => (client = c));
      await page.navigateTo(`realtime-reporting-example/?port=${port}#mutant/Attributes/HandleAttribute.cs/`);
      await page.whenFileReportLoaded();
      expect((await page.mutantView.mutantDots()).length).to.equal(1);
      const mutantPending = page.mutantView.mutantMarker('0');
      expect(await mutantPending.underlineIsVisible()).to.be.true;

      client.sendMutantTested(defaultEvent);
      const filter = page.mutantView.stateFilter();
      await waitUntil(async () => Boolean(await filter.state(MutantStatus.Killed).isDisplayed()));
      expect((await page.mutantView.mutantDots()).length).to.equal(0);
      await filter.state(MutantStatus.Killed).click();
      expect((await page.mutantView.mutantDots()).length).to.equal(1);
    });

    it('should keep the drawer open if it has been selected while an update comes through', async () => {
      server.on('client-connected', (c) => (client = c));
      await page.navigateTo(`realtime-reporting-example/?port=${port}#mutant/Attributes/HandleAttribute.cs/`);

      const mutant = page.mutantView.mutantDot('0');
      const drawer = page.mutantView.mutantDrawer();
      await mutant.toggle();
      await drawer.whenHalfOpen();

      client.sendMutantTested(defaultEvent);

      expect(await drawer.isHalfOpen()).to.be.true;
    });
  });
});
