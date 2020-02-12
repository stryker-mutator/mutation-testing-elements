import { CustomElementFixture } from '../helpers/CustomElementFixture';
import { MutationTestReportPopupComponent } from '../../../src/components/mutation-test-report-popup';
import { expect } from 'chai';

describe('mutation-test-report-popup', () => {
  let fixture: CustomElementFixture<MutationTestReportPopupComponent>;
  let popover: HTMLElement;
  beforeEach(async () => {
    fixture = new CustomElementFixture('mutation-test-report-popup');
    await fixture.whenStable();
    popover = fixture.$('.popover');
  });

  afterEach(() => {
    fixture.dispose();
  });

  it('should hide the popup by default', () => {
    expect(getComputedStyle(popover).visibility).eq('hidden');
  });

  it('should be located on the screen if it is placed to the left', async () => {
    const marginLeft = popover.style.marginLeft;
    expect(marginLeft).eq('0px');
  });

  it('should contain header and body', async () => {
    fixture.element.setAttribute('header', 'Foo');
    fixture.element.setAttribute('show', 'show');
    await fixture.whenStable();
    await expectPopupEventuallyVisible();
    expect(fixture.$('.popover-header').innerText).eq('Foo');
    expect(fixture.$('.popover-body').innerHTML.trim()).eq('<slot name="popover-body"></slot>');
  });

  it('should show the popup when the "show" attribute is present', async () => {
    fixture.element.setAttribute('show', 'show');
    fixture.element.setAttribute('header', 'Foo');
    await fixture.whenStable();
    // Wait for the animation to finish
    await expectPopupEventuallyVisible();
  });

  async function expectPopupEventuallyVisible() {
    await fixture.waitFor(() => getComputedStyle(popover).visibility === 'visible');
  }
});
