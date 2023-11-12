import { PageObject } from './PageObject.po.js';

export type Theme = 'dark' | 'light';

export class ThemeSelector extends PageObject {
  public async select(mode: Theme) {
    const needsToggle = (await this.selectedTheme()) !== mode;
    if (needsToggle) {
      return this.$('.check-box-container label').click();
    }
  }

  async selectedTheme(): Promise<Theme> {
    const darkModeSelected = await this.darkModeCheckbox.isChecked();
    return darkModeSelected ? 'dark' : 'light';
  }

  private get darkModeCheckbox() {
    return this.$('input[type="checkbox"]');
  }
}
