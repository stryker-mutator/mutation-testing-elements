import { MutationTestReportThemeSwitchComponent } from '../../../src/components/theme-switch/theme-switch.component.js';
import { CustomElementFixture } from '../helpers/CustomElementFixture.js';

describe(MutationTestReportThemeSwitchComponent.name, () => {
  let sut: CustomElementFixture<MutationTestReportThemeSwitchComponent>;

  beforeEach(async () => {
    sut = new CustomElementFixture('mte-theme-switch');
    await sut.whenStable();
  });

  afterEach(() => {
    sut.dispose();
  });

  it('should be checked when theme is dark', async () => {
    sut.element.setAttribute('theme', 'dark');
    await sut.whenStable();
    const input: HTMLInputElement = sut.$('input');

    expect(input).to.have.property('checked', true);
  });

  it('should not be checked when theme is light', async () => {
    sut.element.setAttribute('theme', 'light');
    await sut.whenStable();
    const input = sut.$('input');

    expect(input).to.have.property('checked', false);
  });

  it("should switch to checked on click when it's dark", async () => {
    const input: HTMLInputElement = sut.$('input');
    sut.element.setAttribute('theme', 'dark');
    await sut.whenStable();

    input.click();
    expect(input).to.have.property('checked', false);
  });

  it("should switch to checked on click when it's light", async () => {
    const input: HTMLInputElement = sut.$('input');
    sut.element.setAttribute('theme', 'light');
    await sut.whenStable();

    input.click();
    expect(input).to.have.property('checked', true);
  });

  it('should trigger a theme-switch event when clicked', async () => {
    const act = () => {
      const input: HTMLInputElement = sut.$('input');
      input.click();
    };

    const result = await sut.catchCustomEvent('theme-switch', act);
    expect(result).ok;
  });

  it('should switch theme from dark to light', async () => {
    const act = () => {
      const input: HTMLInputElement = sut.$('input');
      input.click();
    };

    sut.element.setAttribute('theme', 'dark');
    await sut.whenStable();

    const result = await sut.catchCustomEvent('theme-switch', act);
    expect(result).ok;
    expect(result).to.have.property('detail', 'light');
  });

  it('should switch theme from light to dark', async () => {
    const act = () => {
      const input: HTMLInputElement = sut.$('input');
      input.click();
    };

    sut.element.setAttribute('theme', 'light');
    await sut.whenStable();

    const result = await sut.catchCustomEvent('theme-switch', act);
    expect(result).ok;
    expect(result).to.have.property('detail', 'dark');
  });
});
