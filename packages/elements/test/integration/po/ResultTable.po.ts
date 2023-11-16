import { PageObject } from './PageObject.po.js';
import { ResultTableRow } from './ResultTableRow.po.js';

export class ResultTable extends PageObject {
  public head() {
    return this.$$('thead th');
  }

  public async rows() {
    const rows = await this.$$('tbody tr');
    return rows.map((row) => new ResultTableRow(row, this.browser));
  }

  public row(name: string) {
    return new ResultTableRow(this.$(`tbody tr[title="${name}"]`), this.browser);
  }
}
