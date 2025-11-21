import { PageObject } from './PageObject.po.js';

export class RealTimeProgressBar extends PageObject {
  public async smallProgressBarVisible() {
    return this.smallProgressBar.evaluate((el) => getComputedStyle(el).opacity === '1');
  }

  get progressBar() {
    return this.$('div[data-test-id="progress-bar"]');
  }

  get smallProgressBar() {
    return this.$('div[data-test-id="small-progress-bar"]');
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
