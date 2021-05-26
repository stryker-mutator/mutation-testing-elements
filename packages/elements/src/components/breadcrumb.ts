import { LitElement, html, property, customElement } from 'lit-element';
import { bootstrap } from '../style';
import { toAbsoluteUrl } from '../lib/htmlHelpers';
import { View } from '../lib/router';

@customElement('mte-breadcrumb')
export class MutationTestReportBreadcrumbComponent extends LitElement {
  @property()
  public path: string[] | undefined;

  @property()
  public view!: View;

  get rootName(): string {
    switch (this.view) {
      case View.mutant:
        return 'All files';
      case View.test:
        return 'All tests';
    }
  }

  public static styles = [bootstrap];

  public render() {
    return html`
      <ol class="breadcrumb rounded">
        ${this.path && this.path.length > 0 ? this.renderLink(this.rootName, []) : this.renderActiveItem(this.rootName)}
        ${this.renderBreadcrumbItems()}
      </ol>
    `;
  }

  private renderBreadcrumbItems() {
    if (this.path) {
      const path = this.path;
      return path.map((item, index) => {
        if (index === path.length - 1) {
          return this.renderActiveItem(item);
        } else {
          return this.renderLink(item, path.slice(0, index + 1));
        }
      });
    }
    return undefined;
  }

  private renderActiveItem(title: string) {
    return html` <li class="breadcrumb-item active" aria-current="page">${title}</li> `;
  }

  private renderLink(title: string, path: string[]) {
    return html` <li class="breadcrumb-item"><a href="${toAbsoluteUrl(this.view, ...path)}">${title}</a></li> `;
  }
}
