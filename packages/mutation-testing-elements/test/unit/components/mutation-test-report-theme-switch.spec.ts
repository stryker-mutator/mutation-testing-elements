import { expect } from 'chai';
import { MutationTestReportThemeSwitchComponent } from '../../../src/components/mutation-test-report-theme-switch';
// import { expect } from 'chai';
import { CustomElementFixture } from '../helpers/CustomElementFixture';

describe(MutationTestReportThemeSwitchComponent.name, () => {
  let sut: CustomElementFixture<MutationTestReportThemeSwitchComponent>;

  beforeEach(async () => {
    sut = new CustomElementFixture('mutation-test-report-theme-switch');
    await sut.whenStable();
  });

  afterEach(() => {
    sut.dispose();
  });

  it('should have the specified initial state', () => {
    const input = sut.$$('input');
    expect(input).has('checked');
  });
});
