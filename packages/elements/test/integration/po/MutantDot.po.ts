import { isElementVisible } from '../lib/helpers';
import { MutantElement } from './MutantElement.po';

export class MutantDot extends MutantElement {
  public async isActive(): Promise<boolean> {
    const classes = await this.classes();
    return classes.includes('selected');
  }

  public isVisible(): Promise<boolean> {
    return isElementVisible(this.host);
  }
}
