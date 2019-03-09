import { PageObject } from './PageObject.po';
import { ResultTableRow } from './ResultTableRow.po';

export class ResultTable extends PageObject {

  public head() {
    return this.$$('thead th');
  }

  public async rows() {
    const rows = await this.$$('tbody tr');
    return rows.map(row => new ResultTableRow(row));
  }

  public async row(name: string) {
    const rows = await this.rows();
    const names = (await Promise.all(rows.map(row => row.name()))).map(name => name.trim());
    const index = names.indexOf(name);
    if (index === -1) {
      throw new Error(`Name "${name}" not found in table. Only found names: ${names.map(n => `"${n}"`).join(', ')}`);
    } else {
      return rows[index];
    }
  }

}
