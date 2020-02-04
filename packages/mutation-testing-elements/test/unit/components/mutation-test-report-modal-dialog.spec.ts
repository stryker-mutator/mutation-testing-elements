import { MutationTestReportModalDialogComponent } from '../../../src/components/mutation-test-report-modal-dialog';
import { CustomElementFixture } from '../helpers/CustomElementFixture';
import { expect } from 'chai';

describe(MutationTestReportModalDialogComponent.name, () => {
  let sut: CustomElementFixture<MutationTestReportModalDialogComponent>;
  beforeEach(async () => {
    sut = new CustomElementFixture('mutation-test-report-modal-dialog');
    await sut.updateComplete;
  });

  afterEach(() => {
    sut.dispose();
  });

  it('should not render by default', () => {
    const modal = sut.$('div.modal');
    expect(sut.element.show).false;
    expect(modal.hidden).true;
  });

  it('should render when show attribute is present', async () => {
    sut.element.setAttribute('show', 'true');
    await sut.updateComplete;
    const modal = sut.$('div.modal');
    expect(modal.hidden).false;
  });

  it('should display the header in the title', async () => {
    sut.element.header = 'Test header';
    await sut.updateComplete;
    const title = sut.$('h5.modal-title');
    expect(title.textContent).eq('Test header');
  });

  it('should emit close event when close button is clicked', async () => {
    const act = () => {
      const closeButton = sut.$('.modal-footer button');
      closeButton.click();
    };
    const result = await sut.catchEvent('close-dialog', act);
    expect(result).to.be.ok;
  });

  it('should emit close event when clicking next to the dialog', async () => {
    const act = () => {
      const dialog = sut.$('div.modal');
      dialog.click();
    };
    const result = await sut.catchEvent('close-dialog', act);
    expect(result).ok;
  });

  it('should not emit the close event when clicking the dialog', async () => {
    const act = () => {
      const dialog = sut.$('div.modal-dialog');
      dialog.click();
    };

    const result = await sut.catchEvent('close-dialog', act);
    expect(result).undefined;
  });
});
