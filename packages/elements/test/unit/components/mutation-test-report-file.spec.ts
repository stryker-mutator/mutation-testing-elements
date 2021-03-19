import { CustomElementFixture } from '../helpers/CustomElementFixture';
import { MutationTestReportFileComponent } from '../../../src/components/file/file.component';
import { expect } from 'chai';
import { FileResult, MutantStatus } from 'mutation-testing-report-schema/api';
import { MutationTestReportMutantComponent } from '../../../src/components/mutant/mutant.component';
import { MutationTestReportFileStateFilterComponent, StateFilter } from '../../../src/components/state-filter/state-filter.component';
import { createFileResult } from '../../helpers/factory';
import { createCustomEvent } from '../../../src/lib/custom-events';

describe(MutationTestReportFileComponent.name, () => {
  let sut: CustomElementFixture<MutationTestReportFileComponent>;
  let fileResult: FileResult;

  beforeEach(async () => {
    fileResult = createFileResult();
    sut = new CustomElementFixture('mte-file');
    sut.element.model = fileResult;
    await sut.whenStable();
  });

  afterEach(() => {
    sut.dispose();
  });

  it('should show the code', () => {
    expect(sut.$('code').textContent).eq(fileResult.source);
  });

  it('should highlight the code', () => {
    expect(sut.$('code .token')).ok;
  });

  describe('with `mte-mutant`', () => {
    let mutantComponent: MutationTestReportMutantComponent;
    let legendComponent: MutationTestReportFileStateFilterComponent<MutantStatus>;

    beforeEach(() => {
      mutantComponent = sut.$('mte-mutant') as MutationTestReportMutantComponent;
      legendComponent = sut.$('mte-state-filter') as MutationTestReportFileStateFilterComponent<MutantStatus>;
    });

    it('should populate `mte-mutant` elements with mutants', () => {
      expect(mutantComponent.mutant).eq(sut.element.model.mutants[0]);
    });

    it('should expand `mte-mutant` when the "expand-all" event is triggered', async () => {
      legendComponent.dispatchEvent(createCustomEvent('expand-all', undefined));
      await sut.whenStable();
      expect(mutantComponent.expand).true;
    });

    it('should collapse `mte-mutant` when the "collapse-all" event is triggered', async () => {
      mutantComponent.expand = true;
      legendComponent.dispatchEvent(createCustomEvent('collapse-all', undefined));
      await sut.whenStable();
      expect(mutantComponent.expand).false;
    });

    it('should update hide a mutant if it is filtered', async () => {
      // Arrange
      const filters: StateFilter<MutantStatus>[] = [
        {
          enabled: false,
          count: 1,
          status: MutantStatus.Killed,
          context: 'success',
          label: '✅ Killed',
        },
      ];
      mutantComponent.show = true;

      // Act
      legendComponent.dispatchEvent(createCustomEvent('filters-changed', filters));
      await sut.whenStable();

      // Assert
      expect(mutantComponent.show).false;
    });
  });
});
