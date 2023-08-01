import { MutationTestReportBreadcrumbComponent } from '../../../src/components/breadcrumb';
import { expect } from 'chai';
import { CustomElementFixture } from '../helpers/CustomElementFixture';
import { View } from '../../../src/lib/router';

describe(MutationTestReportBreadcrumbComponent.name, () => {
  let sut: CustomElementFixture<MutationTestReportBreadcrumbComponent>;

  beforeEach(async () => {
    sut = new CustomElementFixture('mte-breadcrumb');
    sut.element.view = View.mutant;
    await sut.whenStable();
  });

  afterEach(() => {
    sut.dispose();
  });

  it('should show the root item as "All files" for the "mutant" view', () => {
    const elements = sut.$$('li');
    expect(elements).lengthOf(1);
    expect(elements[0].textContent?.trim()).eq('All files');
    expect(elements[0].querySelector('a')).eq(null);
  });

  it('should show the root item as "All tests" for the "test" view', async () => {
    sut.element.view = View.test;
    await sut.whenStable();
    const elements = sut.$$('li');
    expect(elements).lengthOf(1);
    expect(elements[0].textContent?.trim()).eq('All tests');
    expect(elements[0].querySelector('a')).eq(null);
  });

  it('should show a breadcrumb of 2 items if path has 1 item', async () => {
    sut.element.path = ['foo.js'];
    await sut.whenStable();
    const elements = sut.$$('li');
    expect(elements).lengthOf(2);
    const anchor = elements[0].querySelector('a')!;
    expect(anchor).ok;
    expect(anchor.href).eq(href('#mutant'));
    expect(elements[1].textContent?.trim()).eq('foo.js');
    expect(elements[1].querySelector('a')).null;
  });

  it('should show a breadcrumb of 3 items if path has 2 item', async () => {
    sut.element.path = ['bar', 'foo.js'];
    await sut.whenStable();
    const elements = sut.$$('li');
    expect(elements).lengthOf(3);
    const rootLink = elements[0].querySelector('a')!;
    expect(rootLink).ok;
    expect(rootLink.href).eq(href('#mutant'));
    expect(elements[1].textContent?.trim()).eq('bar');
    const barAnchor = elements[1].querySelector('a')!;
    expect(barAnchor).ok;
    expect(barAnchor.href).eq(href('#mutant/bar'));
    expect(elements[2].textContent?.trim()).eq('foo.js');
    expect(elements[2].querySelector('a')).null;
  });

  function href(fragment: string) {
    return `${window.location.toString().split('#')[0]}${fragment}`;
  }
});
