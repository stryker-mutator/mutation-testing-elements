import { ReportPage } from './po/ReportPage';
import { getCurrent } from './lib/browser';
import { expect } from 'chai';

describe('File report "infection-php-example/TextFileLogger.php"', () => {
  let page: ReportPage;

  before(async () => {
    page = new ReportPage(getCurrent());
    await page.navigateTo('');
    await page.navigateTo('infection-php-example/#mutant/TextFileLogger.php');
  });

  it('should highlight the code', async () => {
    expect(await page.mutantView.isCodeHighlighted()).true;
  });

  it('should show mutants', async () => {
    // Wait for code to be highted first
    expect(await page.mutantView.isCodeHighlighted()).true;
    expect(await page.mutantView.mutant('ebf143eb565188ddd7959bfbe70f631f').isButtonVisible()).true;
  });
});
