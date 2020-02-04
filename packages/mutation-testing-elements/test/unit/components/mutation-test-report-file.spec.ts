import { CustomElementFixture } from '../helpers/CustomElementFixture';
import { MutationTestReportFileComponent } from '../../../src/components/mutation-test-report-file';
import { expect } from 'chai';
import { FileResult, MutantStatus, MutantResult } from 'mutation-testing-report-schema';
import { MutationTestReportMutantComponent, SHOW_MORE_EVENT } from '../../../src/components/mutation-test-report-mutant';
import { MutationTestReportFileLegendComponent, MutantFilter } from '../../../dist/components/mutation-test-report-file-legend';
import { createFileResult } from '../../helpers/factory';
import { MutationTestReportModalDialogComponent } from '../../../dist/components/mutation-test-report-modal-dialog';

describe(MutationTestReportFileComponent.name, () => {
  let sut: CustomElementFixture<MutationTestReportFileComponent>;
  let fileResult: FileResult;

  beforeEach(async () => {
    fileResult = createFileResult();
    sut = new CustomElementFixture('mutation-test-report-file');
    sut.element.model = fileResult;
    await sut.updateComplete;
  });

  afterEach(() => {
    sut.dispose();
  });

  it('should show the code', () => {
    expect(sut.$('code').textContent).eq(fileResult.source);
  });

  it('should highlight the code', () => {
    expect(sut.$('code .hljs-keyword')).ok;
  });

  describe('with `mutation-test-report-mutant`', () => {
    let mutantComponent: MutationTestReportMutantComponent;
    let legendComponent: MutationTestReportFileLegendComponent;

    beforeEach(() => {
      mutantComponent = sut.$('mutation-test-report-mutant') as MutationTestReportMutantComponent;
      legendComponent = sut.$('mutation-test-report-file-legend') as MutationTestReportFileLegendComponent;
    });

    it('should populate `mutation-test-report-mutant` elements with mutants', () => {
      expect(mutantComponent.mutant).eq(sut.element.model.mutants[0]);
    });

    it('should expand `mutation-test-report-mutant` when the "expand-all" event is triggered', async () => {
      legendComponent.dispatchEvent(new CustomEvent('expand-all'));
      await sut.updateComplete;
      expect(mutantComponent.expand).true;
    });

    it('should collapse `mutation-test-report-mutant` when the "collapse-all" event is triggered', async () => {
      mutantComponent.expand = true;
      legendComponent.dispatchEvent(new CustomEvent('collapse-all'));
      await sut.updateComplete;
      expect(mutantComponent.expand).false;
    });

    it('should update hide a mutant if it is filtered', async () => {
      // Arrange
      const filters: MutantFilter[] = [
        {
          enabled: false,
          numberOfMutants: 1,
          status: MutantStatus.Killed
        }
      ];
      mutantComponent.show = true;

      // Act
      legendComponent.dispatchEvent(new CustomEvent('filters-changed', { detail: filters }));
      await sut.updateComplete;

      // Assert
      expect(mutantComponent.show).false;
    });

    describe('the modal dialog', () => {
      it('should not be shown when opening the page', () => {
        mutantComponent.show = true;
        const background = sut.$('.modal-backdrop');
        const dialog = sut.$('mutation-test-report-modal-dialog');

        expect(background).null;
        expect(dialog).null;
      });

      it('should be shown when a show-more-click event is received', async () => {
        // Arrange
        mutantComponent.show = true;
        const mutant = createMutantResult();

        // Act
        legendComponent.dispatchEvent(new CustomEvent(SHOW_MORE_EVENT, { detail: mutant, bubbles: true, composed: true }));
        await sut.updateComplete;
        const dialog = sut.$('mutation-test-report-modal-dialog');

        // Assert
        expect(dialog).ok;
      });

      it('should show the correct header when the dialog is opened', async () => {
        // Arrange
        mutantComponent.show = true;
        const mutant = createMutantResult({
          id: '30',
          mutatorName: 'testMutator',
          status: MutantStatus.Killed
        });

        // Act
        await openDialog(mutant);
        const dialog = sut.$('mutation-test-report-modal-dialog') as MutationTestReportModalDialogComponent;

        // Assert
        expect(dialog.header).eq(`30: testMutator - ✅ Killed`);
      });

      it("should display the description in the dialog when it's opened", async () => {
        // Arrange
        mutantComponent.show = true;
        const mutant = createMutantResult({
          description: 'This is a very weird mutant'
        });

        // Act
        await openDialog(mutant);
        const dialogContent = sut.$('mutation-test-report-modal-dialog p');

        // Assert
        expect(dialogContent.textContent).eq('This is a very weird mutant');
      });

      it('should show the background when the dialog is opened', async () => {
        // Arrange
        mutantComponent.show = true;

        // Act
        await openDialog();
        const background = sut.$('.modal-backdrop');

        // Assert
        expect(background).ok;
        expect(background.hidden).false;
      });

      it('should hide when a close-dialog event is received', async () => {
        // Arrange
        mutantComponent.show = true;

        // Act
        await openDialog();
        legendComponent.dispatchEvent(new CustomEvent('close-dialog', { detail: undefined, bubbles: true, composed: true }));
        await sut.updateComplete;

        const background = sut.$('.modal-backdrop');
        const dialog = sut.$('mutation-test-report-modal-dialog');

        // Assert
        expect(background).null;
        expect(dialog).null;
      });
    });

    function createMutantResult(overrides?: Partial<MutantResult>) {
      const defaults: MutantResult = {
        id: '42',
        location: {
          end: { column: 3, line: 4 },
          start: { line: 3, column: 4 }
        },
        mutatorName: 'fooMutator',
        replacement: '+',
        status: MutantStatus.Timeout
      };
      return { ...defaults, ...overrides };
    }

    async function openDialog(mutant?: MutantResult) {
      let detail = mutant;
      if (!detail) {
        detail = createMutantResult();
      }
      legendComponent.dispatchEvent(new CustomEvent(SHOW_MORE_EVENT, { detail, bubbles: true, composed: true }));
      await sut.updateComplete;
    }
  });
});
