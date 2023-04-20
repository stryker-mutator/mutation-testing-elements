import { expect } from 'chai';
import { SseTestServer } from './lib/SseServer';
import { getCurrent } from './lib/browser';
import { ReportPage } from './po/ReportPage';
import { sleep } from './lib/helpers';
import { MutantStatus } from 'mutation-testing-report-schema';

describe('realtime reporting', () => {
  const server: SseTestServer = new SseTestServer();
  const defaultEvent = { name: 'mutation', data: { id: '0', status: 'Killed' } };

  before(() => {
    server.start();
  });

  let page: ReportPage;
  let port: number;

  beforeEach(async () => {
    port = server.port ?? 0;
    page = new ReportPage(getCurrent());
    await page.navigateTo(`realtime-reporting-example/?port=${port}`);
    await page.whenFileReportLoaded();
  });

  describe('when navigating to the overview page', () => {
    it('should update the mutation testing metrics', async () => {
      const allFilesRow = page.mutantView.resultTable().row('All files');
      const attributesRow = page.mutantView.resultTable().row('Attributes');
      const wrappitContextRow = page.mutantView.resultTable().row('WrappitContext.cs');

      server.send(defaultEvent);
      server.send({ name: 'mutation', data: { id: '1', status: 'Survived' } });
      await sleep(25);

      expect(await allFilesRow.progressBar().percentageText()).to.eq('50.00');
      expect(await attributesRow.progressBar().percentageText()).to.eq('100.00');
      expect(await wrappitContextRow.progressBar().percentageText()).to.eq('0.00');
    });
  });

  describe('when navigating to a file with 1 mutant', () => {
    beforeEach(async () => {
      await page.navigateTo(`realtime-reporting-example/?port=${port}#mutant/Attributes/HandleAttribute.cs/`);
    });

    it('should update the state of a mutant', async () => {
      expect(await page.mutantView.mutantDots()).to.be.lengthOf(1);
      const mutantPending = page.mutantView.mutantMarker('0');
      expect(await mutantPending.underlineIsVisible()).to.be.true;

      server.send(defaultEvent);
      await sleep(25);

      expect(await page.mutantView.mutantDots()).to.be.lengthOf(0);
      const filter = page.mutantView.stateFilter();
      await filter.state(MutantStatus.Killed).click();
      expect(await page.mutantView.mutantDots()).to.be.lengthOf(1);
    });

    it('should keep the drawer open if it has been selected while an update comes through', async () => {
      const mutant = page.mutantView.mutantDot('0');
      const drawer = page.mutantView.mutantDrawer();
      await mutant.toggle();
      await drawer.whenHalfOpen();
      expect(await drawer.isHalfOpen()).to.be.true;

      server.send(defaultEvent);
      await sleep(25);

      expect(await drawer.isHalfOpen()).to.be.true;
    });
  });
});
