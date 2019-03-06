import { CustomElementFixture } from '../helpers/CustomElementFixture';
import { MutationTestReportFileComponent } from '../../../src/components/mutation-test-report-file';
import { expect } from 'chai';
import { createFileResult } from '../model/index.spec';
import { FileResultModel } from '../../../src/model';
import { FileResult, MutantStatus } from 'mutation-testing-report-schema';
import { MutationTestReportMutantComponent } from '../../../src/components/mutation-test-report-mutant';
import { MutationTestReportFileLegendComponent, MutantFilter } from '../../../src/components/mutation-test-report-file-legend';

describe(MutationTestReportFileComponent.name, () => {
  let sut: CustomElementFixture<MutationTestReportFileComponent>;
  let fileResult: FileResult;

  beforeEach(async () => {
    fileResult = createFileResult();
    sut = new CustomElementFixture('mutation-test-report-file');
    sut.element.model = new FileResultModel('foo.js', 'foo.js', fileResult);
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
      const filters: MutantFilter[] = [{
        enabled: false,
        numberOfMutants: 1,
        status: MutantStatus.Killed
      }];
      mutantComponent.show = true;

      // Act
      legendComponent.dispatchEvent(new CustomEvent('filters-changed', { detail: filters }));
      await sut.updateComplete;

      // Assert
      expect(mutantComponent.show).false;
    });

  });
});
