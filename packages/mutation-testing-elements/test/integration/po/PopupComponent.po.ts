import { PageObject } from './PageObject.po';
import { getCurrent } from '../lib/browser';

export class PopupComponent extends PageObject {
  public async isVisible() {
    // Wait for animation to finish
    await getCurrent().sleep(500);
    const opacity = await this.$('>>> .popover').getCssValue('opacity');
    return opacity === '1';
  }
}
