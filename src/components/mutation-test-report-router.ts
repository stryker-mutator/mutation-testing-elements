
import { LitElement, customElement } from 'lit-element';

@customElement('mutation-test-report-router')
export class MutationTestReportRouterComponent extends LitElement {

  public connectedCallback() {
    super.connectedCallback();
    window.addEventListener('hashchange', this.updatePath);
    this.updatePath();
  }

  private readonly updatePath = () => {
    const pathAsString = window.location.hash.substr(1);
    const path = pathAsString.length ? pathAsString.split('/') : [];
    this.dispatchEvent(new CustomEvent('path-changed', { detail: path }));
  }
}
