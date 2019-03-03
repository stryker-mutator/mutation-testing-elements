
import { LitElement, customElement } from 'lit-element';

export interface PathChangedEvent extends CustomEvent<string[]> { }
export const PATH_CHANGED_EVENT = 'path-changed';

@customElement('mutation-test-report-router')
export class MutationTestReportRouterComponent extends LitElement {

  public connectedCallback() {
    super.connectedCallback();
    window.addEventListener('hashchange', this.updatePath);
    this.updatePath();
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('hashchange', this.updatePath);
  }

  private readonly updatePath = () => {
    const pathString = window.location.hash.substr(1);
    const path = pathString.length ? pathString.split('/') : [];
    const event: PathChangedEvent = new CustomEvent(PATH_CHANGED_EVENT, { detail: path });
    this.dispatchEvent(event);
  }
}
