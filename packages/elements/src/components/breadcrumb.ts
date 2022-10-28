import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { toAbsoluteUrl } from '../lib/html-helpers';
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

  /**
   * Disable shadow-DOM for this component to let parent styles apply (such as dark theme)
   */
  protected override createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  public render() {
    return html`<nav
      class="flex px-5 py-3 mb-6 text-gray-700 border border-slate-200 rounded-md bg-slate-200 dark:bg-slate-800 dark:border-slate-700 transition-all"
      aria-label="Breadcrumb"
    >
      <ol class="inline-flex items-center">
        ${this.path && this.path.length > 0 ? this.renderLink(this.rootName, []) : this.renderActiveItem(this.rootName)}
        ${this.renderBreadcrumbItems()}
      </ol>
    </nav> `;
  }

  private renderBreadcrumbItems() {
    if (this.path) {
      const path = this.path;
      return repeat(
        path,
        (item) => item,
        (item, index) => {
          if (index === path.length - 1) {
            return this.renderActiveItem(item);
          } else {
            return this.renderLink(item, path.slice(0, index + 1));
          }
        }
      );
    }
    return undefined;
  }

  private renderActiveItem(title: string) {
    return html`<li aria-current="page">
      <span class="ml-1 md:ml-2 text-sm font-medium text-gray-800 dark:text-gray-200">${title}</span>
    </li> `;
  }

  private renderLink(title: string, path: string[]) {
    return html`<li class="after:content-['/'] after:text-gray-800 after:dark:text-gray-200 md:after:pl-1">
      <a
        href="${toAbsoluteUrl(this.view, ...path)}"
        class="ml-1 md:ml-2 text-sm font-medium text-blue-700 dark:text-blue-400 hover:text-gray-900 dark:hover:text-white hover:underline"
        >${title}</a
      >
    </li>`;
  }
}
