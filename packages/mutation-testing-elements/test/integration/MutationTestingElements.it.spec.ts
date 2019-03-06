import { StaticFileServer } from './lib/StaticFileServer';
import path from 'path';
import { expect } from 'chai';
import { DirectoryReportPage } from './po/DirectoryReport.page.spec';

describe('MutationTestingElements - reporting integration', () => {
  const server = new StaticFileServer([path.resolve(__dirname, '..', '..', 'testResources'), path.resolve(__dirname, '..', '..', 'dist')]);
  let page: DirectoryReportPage;

  before(async () => {
    await server.listen(8080);
  });

  beforeEach(async () => {
    page = new DirectoryReportPage();
  });

  describe('Scala example', () => {
    beforeEach(async () => {
      await page.navigateTo('scala-example');
    });
    it('should have title "All files - Stryker report"', async () => {
      const title = await page.getTitle();
      expect(title).eq('All files - Stryker report');
    });
  });
});
