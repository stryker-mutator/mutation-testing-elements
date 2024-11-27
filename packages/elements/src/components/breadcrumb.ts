import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

import { createCustomEvent } from '../lib/custom-events.js';
import { toAbsoluteUrl } from '../lib/html-helpers.js';
import { View } from '../lib/router.js';
import { searchIcon } from '../lib/svg-icons.js';
import { BaseElement } from './base-element.js';

@customElement('mte-breadcrumb')
export class MutationTestReportBreadcrumbComponent extends BaseElement {
  @property({ type: Array, attribute: false })
  public declare path: string[] | undefined;

  @property()
  public declare view: View;

  get rootName(): string {
    switch (this.view) {
      case View.mutant:
        return 'All files';
      case View.test:
        return 'All tests';
    }
  }

  public render() {
    return html`<nav class="my-4 flex rounded-md border border-primary-600 bg-primary-100 p-3 text-gray-700" aria-label="Breadcrumb">
      <ol class="inline-flex items-center">
        ${this.path && this.path.length > 0 ? this.#renderLink(this.rootName, []) : this.#renderActiveItem(this.rootName)}
        ${this.#renderBreadcrumbItems()}
      </ol>
      ${this.#renderSearchIcon()}
    </nav> `;
  }

  #renderBreadcrumbItems() {
    if (this.path) {
      const path = this.path;
      return repeat(
        path,
        (item) => item,
        (item, index) => {
          if (index === path.length - 1) {
            return this.#renderActiveItem(item);
          } else {
            return this.#renderLink(item, path.slice(0, index + 1));
          }
        },
      );
    }
    return undefined;
  }

  #renderActiveItem(title: string) {
    return html`<li aria-current="page">
      <span class="ml-1 text-sm font-medium text-gray-800 md:ml-2">${title}</span>
    </li> `;
  }

  #renderLink(title: string, path: string[]) {
    return html`<li class="after:text-gray-800 after:content-['/'] md:after:pl-1">
      <a
        href="${toAbsoluteUrl(this.view, ...path)}"
        class="ml-1 text-sm font-medium text-primary-800 underline hover:text-gray-900 hover:underline md:ml-2"
        >${title}</a
      >
    </li>`;
  }

  #renderSearchIcon() {
    return html`
      <button @click="${() => this.#dispatchFilePickerOpenEvent()}" class="ml-auto" title="Open file picker (Ctrl-K)">${searchIcon}</button>
    `;
  }

  #dispatchFilePickerOpenEvent() {
    // Move focus out of the button to the dialog
    // In Chrome we need to call on `this`, on Firefox we need to call on the button
    this.blur();
    this.renderRoot.querySelector('button')?.blur();

    this.dispatchEvent(createCustomEvent('mte-file-picker-open', undefined));
  }
}
