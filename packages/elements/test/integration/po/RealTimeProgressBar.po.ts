import { PageObject } from './PageObject.po.js';

export class RealTimeProgressBar extends PageObject {
  public async smallProgressBarVisible() {
    const smallProgressBar = this.$('div.pointer-events-none');
    return (await smallProgressBar.evaluate((el) => getComputedStyle(el).opacity)) === '1';
  }

  get progressBar() {
    return this.$('div.my-4');
  }

  public async progressBarWidth() {
    return await this.$('.parts > div')
      .first()
      .boundingBox()
      .then((el) => el?.width);
  }

  public killedCount() {
    return this.host.getByTitle('killed + timeout').first();
  }
}
