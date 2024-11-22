import { FilePicker } from './FilePicker.po.js';
import { PageObject } from './PageObject.po.js';

export default class Breadcrumb extends PageObject {
  public items() {
    return this.$('li');
  }

  public async navigate(to: string): Promise<void> {
    const anchor = this.host.getByText(to);
    await anchor.click();
  }

  public async openFilePicker(): Promise<FilePicker> {
    const button = this.$('button');
    await button.click();

    return new FilePicker(this.browser.locator('mutation-test-report-app >> mte-file-picker'), this.browser);
  }
}
