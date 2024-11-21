import { PageObject } from './PageObject.po.js';

export class FilePicker extends PageObject {
  public async search(query: string) {
    return this.$('input').fill(query);
  }

  public async results() {
    return this.$$('#files li');
  }
}
