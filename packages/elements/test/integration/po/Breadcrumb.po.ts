import { PageObject } from './PageObject.po.js';

export default class Breadcrumb extends PageObject {
  public items() {
    return this.$('li');
  }

  public async navigate(to: string): Promise<void> {
    const anchor = this.host.getByText(to);
    await anchor.click();
  }
}
