import { expect } from '@playwright/test';

import { PageObject } from './PageObject.po.js';

export class ProgressBar extends PageObject {
  readonly #progressBar = this.$('[role=progressbar]');

  public expectPercentage = async (percentage: string | number) => expect(this.#progressBar).toHaveAttribute('aria-valuenow', `${percentage}`);
  public barSize = async () => (await this.#progressBar.boundingBox()) ?? { width: 0, height: 0 };
  public totalSize = async () => (await this.host.boundingBox()) ?? { width: 0, height: 0 };
  public relativeBarWidth = async () => {
    const [totalSize, barSize] = await Promise.all([this.totalSize(), this.barSize()]);
    return Math.floor((barSize.width / totalSize.width) * 100);
  };
}
