import { PageObject } from './PageObject.po.spec';
import { constants } from '../lib/constants';
import Breadcrumb from './Breadcrumb.po.spec';
import { getCurrent } from '../lib/browser';

export class Page extends PageObject {

  constructor() {
    super(getCurrent());
  }

  public navigateTo(path: string) {
    return getCurrent().get(constants.BASE_URL + path);
  }

  public getTitle() {
    return getCurrent().getTitle();
  }

  public async breadcrumb(): Promise<Breadcrumb> {
    const host = await this.$('mutation-test-report-breadcrumb');
    return new Breadcrumb(host);
  }
}
