import { LitElement, html, property, customElement } from 'lit-element';
import { bootstrap } from '../style';
import { toAbsoluteUrl } from '../lib/htmlHelpers';
const ROOT_NAME = 'All files';

@customElement('mutation-test-report-breadcrumb')
export class MutationTestReportBreadcrumbComponent extends LitElement {
  @property()
  public path: string[] | undefined;

  public static styles = [bootstrap];

  public render() {
    return html`
      <ol class="breadcrumb">
        ${this.renderRootItem()} ${this.renderBreadcrumbItems()}
      </ol>
    `;
  }

  private renderRootItem() {
    if (this.path && this.path.length) {
      return this.renderLink(ROOT_NAME, '');
    } else {
      return this.renderActiveItem(ROOT_NAME);
    }
  }

  private renderBreadcrumbItems() {
    if (this.path) {
      const path = this.path;
      return path.map((item, index) => {
        if (index === path.length - 1) {
          return this.renderActiveItem(item);
        } else {
          return this.renderLink(item, `${path.filter((_, i) => i <= index).join('/')}`);
        }
      });
    }
    return undefined;
  }

  private renderActiveItem(title: string) {
    return html` <li class="breadcrumb-item active" aria-current="page">${title}</li> `;
  }

  private renderLink(title: string, url: string) {
    return html` <li class="breadcrumb-item"><a href="${toAbsoluteUrl(url)}">${title}</a></li> `;
  }
}
