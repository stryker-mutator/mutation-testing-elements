
import { LitElement, customElement, property } from 'lit-element';

@customElement('mutation-test-report-title')
export class MutationTestReportRouterComponent extends LitElement {
  @property()
  public set title(value: string) {
    document.title = value;
  }
}
