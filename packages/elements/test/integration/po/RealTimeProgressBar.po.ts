import { PageObject } from './PageObject.po';

export class RealTimeProgressBar extends PageObject {
  public async smallProgressBarVisible() {
    const smallProgressBar = await this.$('div.pointer-events-none');
    return (await smallProgressBar.getCssValue('opacity')) === '1';
  }

  public async progressBarVisible() {
    try {
      await this.$('div.my-4');
      return true;
    } catch {
      return false;
    }
  }

  public async progressBarWidth() {
    return await this.$('.parts > div').getCssValue('width');
  }

  public async killedCount() {
    return await this.$('.parts > div > span').getText();
  }
}
