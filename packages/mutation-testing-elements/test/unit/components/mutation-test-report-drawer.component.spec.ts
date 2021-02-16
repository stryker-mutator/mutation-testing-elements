import { expect } from 'chai';
import { MutationTestReportDrawer } from '../../../src/components/mutation-test-report-drawer/mutation-test-report-drawer.component';
import { CustomElementFixture } from '../helpers/CustomElementFixture';

describe(MutationTestReportDrawer.name, () => {
  let sut: CustomElementFixture<MutationTestReportDrawer>;

  beforeEach(async () => {
    sut = new CustomElementFixture('mutation-test-report-drawer');
    await sut.whenStable();
  });

  afterEach(() => {
    sut.dispose();
  });

  it('should have height = 0 by default', () => {
    expect(getHeightPx()).eq(0);
  });

  it('should have height = 120 when mode = half', async () => {
    sut.element.mode = 'half';
    await sut.whenStable();
    expect(getHeightPx()).eq(120);
  });

  describe('with isDetail = false', () => {
    it('should not render the read-more toggle', () => {
      expect(readMoreToggle()).null;
    });
  });

  describe('with isDetail = true', () => {
    beforeEach(async () => {
      sut.element.hasDetail = true;
      await sut.whenStable();
    });

    it('should show the header and summary but hide the detail', () => {
      expect(sut.$('slot[name="header"]')).ok;
      expect(sut.$('slot[name="summary"]')).ok;
      expect(sut.$('slot[name="detail"]')).null;
    });

    it('should render the read-more toggle', async () => {
      sut.element.mode = 'half';
      await sut.whenStable();
      expect(readMoreToggle().textContent).eq('🔼 More');
    });

    it('should expand to full size when read-more is clicked', async () => {
      sut.element.mode = 'half';
      await sut.whenStable();
      readMoreToggle().click();
      await sut.waitFor(() => getHeightPx() > 120); // use wait for since animation takes time
      expect(getHeightPx()).gt(120);
      expect(sut.element.mode).eq('open');
    });

    it('should change the label of the read-more toggle when fully expanded', async () => {
      sut.element.mode = 'open';
      await sut.whenStable();
      expect(readMoreToggle().textContent).eq('🔽 Less');
    });

    it('should show the detail when opened', async () => {
      sut.element.mode = 'open';
      await sut.whenStable();
      expect(sut.$('slot[name="detail"]')).ok;
    });

    it('should not leak click events when clicked somewhere on the drawer', async () => {
      sut.element.mode = 'half';
      await sut.whenStable();
      const event = await sut.catchNativeEvent('click', () => sut.$('header').click());
      expect(event).undefined;
    });
  });

  function readMoreToggle() {
    return sut.$('[data-testId="btnReadMoreToggle"]');
  }

  function getHeightPx() {
    return Number(/(\d+)px/.exec(sut.style.height)?.[1]);
  }
});
