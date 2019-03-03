import { MutationTestReportTotalsComponent } from '../../../src/components/mutation-test-report-totals';
import { CustomElementFixture } from '../helpers/CustomElementFixture';
import { expect } from 'chai';
import { FileResultModel, DirectoryResultModel, TotalsModel } from '../../../src/model';
import { MutantStatus } from 'mutation-testing-report-schema';

describe(MutationTestReportTotalsComponent.name, () => {
  let sut: CustomElementFixture<MutationTestReportTotalsComponent>;

  beforeEach(async () => {
    sut = new CustomElementFixture('mutation-test-report-totals');
    await sut.updateComplete;
  });

  it('should not show a table if no data is loaded', () => {
    expect(sut.$('table')).eq(null);
  });

  it('should show a table with a single row for a file result', async () => {
    sut.element.model = new FileResultModel('foo.js', 'foo.js', {
      language: 'js',
      mutants: [],
      source: 'const bar = foo();'
    });
    await sut.updateComplete;
    const table = sut.$('table') as HTMLTableElement;
    expect(table).ok;
    expect(table.querySelectorAll('thead th')).lengthOf(11);
    expect(table.querySelectorAll('tbody th, tbody td')).lengthOf(13);
  });

  it('should show a table with a 3 rows for a directory result with 2 directories and one file', async () => {
    const file = new FileResultModel('foo.js', 'foo.js', {
      language: 'js',
      mutants: [],
      source: 'const bar = foo();'
    });
    sut.element.model = new DirectoryResultModel('bar', 'bar', new TotalsModel([{ status: MutantStatus.Killed }]), [
      file,
      new DirectoryResultModel('baz', 'bar/baz', new TotalsModel([]), [])
    ]);
    await sut.updateComplete;
    const table = sut.$('table') as HTMLTableElement;
    expect(table).ok;
    expect(table.querySelectorAll('tbody tr')).lengthOf(3);
  });
});
