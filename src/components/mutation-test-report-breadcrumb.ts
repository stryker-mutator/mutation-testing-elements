import { LitElement, html, property, customElement } from 'lit-element';
import { bootstrap } from '../style';

@customElement('mutation-test-report-breadcrumb')
export class MutationTestReportBreadcrumbComponent extends LitElement {
  @property()
  public path: ReadonlyArray<string> | undefined;

  public static styles = [bootstrap];

  public render() {
    return html`
        <ol class='breadcrumb'>
          ${this.renderRootItem()}
          ${this.path ? this.renderBreadcrumbItems(this.path) : ''}
        </ol>
    `;
  }

  private renderRootItem() {
    if (this.path && this.path.length) {
      return this.renderLink('All files', '#');
    } else {
      return this.renderActiveItem('All files');
    }
  }

  private renderBreadcrumbItems(path: ReadonlyArray<string>) {
    return path.map((item, index) => {
      if (index === path.length - 1) {
        return this.renderActiveItem(item);
      } else {
        return this.renderLink(item, `#${path.filter((_, i) => i <= index).join('/')}`);
      }
    });
  }

  private renderActiveItem(title: string) {
    return html`<li class="breadcrumb-item active" aria-current="page">${title}</li>`;
  }

  private renderLink(title: string, url: string) {
    return html`<li class="breadcrumb-item"><a href="${url}">${title}</a></li>`;
  }
}
