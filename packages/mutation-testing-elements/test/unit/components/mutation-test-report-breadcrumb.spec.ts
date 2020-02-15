import { MutationTestReportBreadcrumbComponent } from '../../../src/components/mutation-test-report-breadcrumb';
import { expect } from 'chai';
import { CustomElementFixture } from '../helpers/CustomElementFixture';

describe(MutationTestReportBreadcrumbComponent.name, () => {

  let sut: CustomElementFixture<MutationTestReportBreadcrumbComponent>;

  beforeEach(async () => {
    sut = new CustomElementFixture('mutation-test-report-breadcrumb');
    await sut.whenStable();
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
    await sut.whenStable();
    const elements = sut.$$('li');
    expect(elements).lengthOf(2);
    const anchor = elements[0].querySelector('a') as HTMLAnchorElement;
    expect(anchor).ok;
    expect(anchor.href).eq(href('#'));
    expect(elements[1].textContent).eq('foo.js');
    expect(elements[1].querySelector('a')).null;
  });

  it('should show a breadcrumb of 3 items if path has 2 item', async () => {
    sut.element.path = ['bar', 'foo.js'];
    await sut.whenStable();
    const elements = sut.$$('li');
    expect(elements).lengthOf(3);
    const rootLink = elements[0].querySelector('a') as HTMLAnchorElement;
    expect(rootLink).ok;
    expect(rootLink.href).eq(href('#'));
    expect(elements[1].textContent).eq('bar');
    const barAnchor = elements[1].querySelector('a') as HTMLAnchorElement;
    expect(barAnchor).ok;
    expect(barAnchor.href).eq(href('#bar'));
    expect(elements[2].textContent).eq('foo.js');
    expect(elements[2].querySelector('a')).null;
  });

  function href(fragment: string) {
    return `${window.location.toString().split('#')[0]}${fragment}`;
  }
});
