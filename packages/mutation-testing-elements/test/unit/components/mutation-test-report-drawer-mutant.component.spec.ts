import { MutationTestReportDrawerMutant } from '../../../src/components/mutation-test-report-drawer-mutant/mutation-test-report-drawer-mutant.component';
import { CustomElementFixture } from '../helpers/CustomElementFixture';

describe(MutationTestReportDrawerMutant.name, () => {
  let sut: CustomElementFixture<MutationTestReportDrawerMutant>;

  beforeEach(() => {
    sut = new CustomElementFixture('mutation-test-report-drawer-mutant');
  });
  afterEach(() => {
    sut.dispose();
  });
});
