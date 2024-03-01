import { MutantElement } from './MutantElement.po.js';

export class MutantDot extends MutantElement {
  public async isActive(): Promise<boolean> {
    const classes = await this.classes();
    return classes.includes('selected');
  }

  get dot() {
    return this.host;
  }
}
