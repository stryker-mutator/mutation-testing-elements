import { DEFAULT_TIMEOUT } from '../lib/constants';
import { PageObject } from './PageObject.po';

export const HALF_OPEN_SIZE = 120;
const CLOSED_SIZE = 0;

export class Drawer extends PageObject {
  private get header() {
    return this.$('[slot="header"]');
  }

  private get readMoreToggle() {
    return this.$('mte-drawer >>> [data-testId="btnReadMoreToggle"]');
  }

  public toggleReadMore() {
    return this.readMoreToggle.click();
  }

  public async detailsVisible() {
    try {
      await this.$('mte-drawer >>> slot[name="detail"]');
      return true;
    } catch (err) {
      if (err instanceof Error && err.message.includes('no such element')) {
        return false;
      }
      throw err;
    }
  }

  public async clickOnHeader() {
    return this.header.click();
  }

  public async height() {
    const { height } = await this.$('mte-drawer').getRect();
    return height;
  }

  public headerText() {
    return this.header.getText();
  }

  public summaryText() {
    return this.$('[slot="summary"]').getText();
  }

  public whenOpen() {
    return this.browser.wait(() => this.isOpen(), DEFAULT_TIMEOUT);
  }

  public whenHalfOpen() {
    return this.browser.wait(() => this.isHalfOpen(), DEFAULT_TIMEOUT);
  }

  public whenClosed() {
    return this.browser.wait(() => this.isClosed(), DEFAULT_TIMEOUT);
  }

  public async isHalfOpen() {
    return (await this.height()) === HALF_OPEN_SIZE;
  }
  public async isClosed() {
    return (await this.height()) === CLOSED_SIZE;
  }

  public async isOpen() {
    return (await this.height()) > HALF_OPEN_SIZE;
  }
}
