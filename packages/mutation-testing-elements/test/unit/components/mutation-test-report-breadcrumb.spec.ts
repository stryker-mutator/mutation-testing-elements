import { MutationTestReportBreadcrumbComponent } from '../../../src/components/mutation-test-report-breadcrumb';
import { expect } from 'chai';
import { CustomElementFixture } from '../helpers/CustomElementFixture';

describe(MutationTestReportBreadcrumbComponent.name, () => {

  let sut: CustomElementFixture<MutationTestReportBreadcrumbComponent>;

  beforeEach(async () => {
    sut = new CustomElementFixture('mutation-test-report-breadcrumb');
    await sut.updateComplete;
  });

  afterEach(() => {
    sut.dispose();
  });

  it('should show the root item', () => {
    const elements = sut.$$('li');
    expect(elements).lengthOf(1);
    expect(elements[0].textContent).eq('All files');
    expect(elements[0].querySelector('a')).eq(null);
  });

  it('should show a breadcrumb of 2 items if path has 1 item', async () => {
    sut.element.path = ['foo.js'];
    await sut.updateComplete;
    const elements = sut.$$('li');
    expect(elements).lengthOf(2);
    expect(elements[0].querySelector('a')).ok;
    expect(elements[1].textContent).eq('foo.js');
    expect(elements[1].querySelector('a')).null;
  });

  it('should show a breadcrumb of 3 items if path has 2 item', async () => {
    sut.element.path = ['bar', 'foo.js'];
    await sut.updateComplete;
    const elements = sut.$$('li');
    expect(elements).lengthOf(3);
    expect(elements[0].querySelector('a')).ok;
    expect(elements[1].textContent).eq('bar');
    expect(elements[1].querySelector('a')).ok;
    expect(elements[2].textContent).eq('foo.js');
    expect(elements[2].querySelector('a')).null;
  });
});
