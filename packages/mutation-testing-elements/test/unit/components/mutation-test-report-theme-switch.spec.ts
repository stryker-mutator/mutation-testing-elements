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
    const input = sut.$('input');

    if (sut.element.theme == 'dark') {
      expect(input).to.have.property('checked');
    } else {
      expect(input).to.not.have.property('checked');
    }
  });

  it('should switch states when clicked', () => {
    const input = sut.$('input');
    input.setAttribute('checked', '');
    input.click();
    expect(input).to.have.property('checked', false);
    input.click();
    expect(input).to.have.property('checked', true);
  });

  it('should trigger a theme-switch event when clicked', async () => {
    const act = () => {
      const input = sut.$('input');
      input.click();
    };

    const result = await sut.catchEvent('theme-switch', act);
    expect(result).ok;
  });

  it('should switch to the correct theme', async () => {
    const act = () => {
      const input = sut.$('input');
      input.click();
    };

    sut.$('input').setAttribute('checked', '');
    let result = await sut.catchEvent('theme-switch', act);
    expect(result).ok;
    expect(result).to.have.property('detail', 'light');

    result = await sut.catchEvent('theme-switch', act);
    expect(result).ok;
    expect(result).to.have.property('detail', 'dark');
  });
});
