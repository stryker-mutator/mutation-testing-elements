import { PageObject } from './PageObject.po';

export class ProgressBar extends PageObject {
  private readonly progressBar = this.$('[role=progressbar]');

  public percentageText = async () => (await this.progressBar).getAttribute('aria-valuenow');
  public barSize = async () => (await this.progressBar).getSize();
  public totalSize = () => this.host.getSize();
  public relativeBarWidth = async () => {
    const [totalSize, barSize] = await Promise.all([this.totalSize(), this.barSize()]);
    return Math.floor((barSize.width / totalSize.width) * 100);
  };
}
