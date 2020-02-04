import { PageObject } from './PageObject.po';
import { until } from 'selenium-webdriver';

export class PopupComponent extends PageObject {
  private readonly popover = this.$('>>> .popover');

  public awaitVisible() {
    return this.browser.wait(until.elementIsVisible(this.popover));
  }

  public awaitInvisible() {
    return this.browser.wait(until.elementIsNotVisible(this.popover));
  }

  public isVisible() {
    return this.popover.isDisplayed();
  }
}
