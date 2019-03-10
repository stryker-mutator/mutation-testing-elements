import { PageObject } from './PageObject.po';

export class MutantComponent extends PageObject {

  public isMutantReplacementCodeVisible = () => this.mutantReplacement().isDisplayed();
  public originalCodeTextDecoration = async () => {
    const textDecoration = await this.originalCode().getCssValue('text-decoration');
    return /* like "none solid rgb(68, 68, 68)" */ textDecoration.split(' ')[0];
  }
  private readonly originalCode = () => this.$('.original-code');
  private readonly mutantReplacement = () => this.$('.replacement');
  private readonly button = () => this.$('.mutant-toggle');
  public async isButtonVisible() {
    try {
      return await this.button().isDisplayed();
    } catch {
      return false;
    }
  }

  public toggleMutant = () => this.button().click();
}
