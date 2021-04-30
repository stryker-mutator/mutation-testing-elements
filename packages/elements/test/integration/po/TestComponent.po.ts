import { isElementVisible } from '../lib/helpers';
import { PageObject } from './PageObject.po';

export class TestComponent extends PageObject {
  private get badge() {
    return this.$('.badge');
  }

  public isVisible() {
    return isElementVisible(this.badge);
  }

  public toggle() {
    return this.badge.click();
  }
}
