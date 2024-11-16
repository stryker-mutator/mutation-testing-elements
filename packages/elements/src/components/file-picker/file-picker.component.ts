import { html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';

import type { FileUnderTestModel, Metrics, MetricsResult, MutationTestMetricsResult, TestFileModel, TestMetrics } from 'mutation-testing-metrics';

import { searchIcon } from '../../lib/svg-icons.js';
import { renderIf } from '../../lib/html-helpers.js';
import { tailwind } from '../../style/index.js';

@customElement('mte-file-picker')
export class MutationTestReportFilePickerComponent extends LitElement {
  static styles = [tailwind];

  #abortController = new AbortController();
  #searchMap = new Map<string, FileUnderTestModel | TestFileModel>();

  @property({ type: Object })
  public declare rootModel: MutationTestMetricsResult;

  @state()
  public declare openPicker: boolean;

  @state()
  public declare filteredFiles: { name: string; file: FileUnderTestModel | TestFileModel }[];

  @state()
  public declare fileIndex: number;

  constructor() {
    super();

    this.openPicker = false;
    this.fileIndex = 0;
  }

  connectedCallback(): void {
    super.connectedCallback();

    this.#prepareMap();
    this.#filter('');

    window.addEventListener('keydown', (e) => this.#handleKeyDown(e), { signal: this.#abortController.signal });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    this.#abortController.abort();
  }

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);

    if (changedProperties.has('rootModel')) {
      this.#prepareMap();
    }
  }

  open() {
    this.openPicker = true;
  }

  render() {
    if (!this.openPicker) {
      return nothing;
    }

    return html`
      <div
        id="backdrop"
        @click="${() => this.#closePicker()}"
        class="fixed left-0 top-0 z-50 flex h-full w-full justify-center bg-black/50 backdrop-blur-lg"
      >
        <div
          @click="${(e: MouseEvent) => e.stopPropagation()}"
          role="dialog"
          id="picker"
          class="m-4 flex h-fit max-h-[500px] w-full max-w-[40rem] flex-col rounded-lg bg-gray-200/60 p-4 backdrop-blur-lg md:w-1/2"
        >
          <div class="mb-2 flex items-center rounded bg-gray-200/60 p-2 backdrop-blur-lg">
            <div class="mx-2 flex items-center text-gray-800">${searchIcon}</div>
            <label for="file-picker-input" class="sr-only">Search for a file</label>
            <input
              id="file-picker-input"
              @keyup="${(e: KeyboardEvent) => this.#handleSearch(e)}"
              type="text"
              style="box-shadow: none"
              class="mr-2 w-full rounded border-0 border-transparent bg-transparent text-gray-800 focus:shadow-none"
              placeholder="Search for a file"
            />
          </div>
          <div tabindex="-1" class="overflow-auto"> ${this.#renderFoundFiles()} </div>
        </div>
      </div>
    `;
  }

  #renderFoundFiles() {
    return html`
      <ul id="files" class="flex flex-col">
        ${renderIf(this.filteredFiles.length === 0, () => html`<li class="text-gray-800">No files found</li>`)}
        ${repeat(
          this.filteredFiles,
          (item) => item.name,
          ({ name, file }, index) => {
            return html` <li>
              <a
                ?data-active="${index === this.fileIndex}"
                tabindex="${index === this.fileIndex ? 0 : -1}"
                @focusout="${() => this.#handleFocus()}"
                @click="${() => this.#closePicker()}"
                class="${classMap({
                  'border-primary-500': index === this.fileIndex,
                })} my-1 flex rounded border-2 border-black bg-black p-1 px-2 text-gray-800 outline-none focus-visible:border-primary-200"
                href="${this.#getFragment(file)}/${name}"
              >
                ${file.result?.name}<span class="mx-2">•</span><span class="text-gray-400">${name}</span>
              </a>
            </li>`;
          },
        )}
      </ul>
    `;
  }

  #handleFocus() {
    this.shadowRoot?.querySelector('input')?.focus();
  }

  #prepareMap() {
    if (this.rootModel == null) {
      return;
    }

    const prepareFiles = <T extends FileUnderTestModel | TestFileModel>(
      result: MetricsResult<T, Metrics | TestMetrics> | undefined,
      parentPath: string | null = null,
      allFilesKey: string,
    ) => {
      if (result === undefined) {
        return;
      }

      if (result.file !== undefined && result.file !== null && result.name !== allFilesKey) {
        this.#searchMap.set(parentPath == null ? result.name : `${parentPath}/${result.name}`, result.file);
      }

      if (result.childResults.length === 0) {
        return;
      }

      result.childResults.forEach((child) => {
        if (parentPath !== allFilesKey && parentPath !== null && result.name !== null) {
          prepareFiles(child, `${parentPath}/${result.name}`, allFilesKey);
        } else if ((parentPath === allFilesKey || parentPath === null) && result.name !== allFilesKey) {
          prepareFiles(child, result.name, allFilesKey);
        } else {
          prepareFiles(child, null, allFilesKey);
        }
      });
    };

    prepareFiles(this.rootModel.systemUnderTestMetrics, null, 'All files');
    prepareFiles(this.rootModel.testMetrics, null, 'All tests');
  }

  #handleKeyDown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      this.#togglePicker(event);
    } else if (!this.openPicker && event.key === '/') {
      this.#togglePicker(event);
    } else if (event.key === 'Escape') {
      this.#closePicker();
    } else if (event.key === 'ArrowUp') {
      this.#handleArrowUp();
    } else if (event.key === 'ArrowDown') {
      this.#handleArrowDown();
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      setTimeout(() => {
        this.#scrollActiveLinkInView();
      });
    }

    if (event.key === 'Enter') {
      this.#handleEnter();
    }
  }

  #scrollActiveLinkInView() {
    const activeLink = this.shadowRoot?.querySelector('a[data-active]');

    if (activeLink != null) {
      activeLink.scrollIntoView({ block: 'nearest' });
    }
  }

  #handleArrowDown() {
    if (this.fileIndex === this.filteredFiles.length - 1) {
      this.fileIndex = 0;
      return;
    }

    this.fileIndex = Math.min(this.filteredFiles.length - 1, this.fileIndex + 1);
  }

  #handleArrowUp() {
    if (this.fileIndex === 0) {
      this.fileIndex = this.filteredFiles.length - 1;
      return;
    }

    this.fileIndex = Math.max(0, this.fileIndex - 1);
  }

  #handleEnter() {
    if (this.filteredFiles.length === 0) {
      return;
    }

    const entry = this.filteredFiles[this.fileIndex];
    window.location.hash = `${this.#getFragment(entry.file)}/${entry.name}`;
    this.#closePicker();
  }

  #togglePicker(event: KeyboardEvent | null = null) {
    event?.preventDefault();
    event?.stopPropagation();

    this.openPicker = !this.openPicker;

    if (!this.openPicker) {
      document.body.style.overflow = 'auto';
    } else {
      document.body.style.overflow = 'hidden';
    }

    void this.updateComplete.then(() => this.#focusInput());
  }

  #focusInput() {
    this.shadowRoot?.querySelector('input')?.focus();
  }

  #closePicker() {
    document.body.style.overflow = 'auto';
    this.openPicker = false;
    this.fileIndex = 0;
    this.#filter('');
  }

  #handleSearch(event: KeyboardEvent) {
    if (!this.openPicker) {
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Tab') {
      return;
    }

    this.#filter((event.target as HTMLInputElement).value);
    this.fileIndex = 0;
  }

  #filter(filterKey: string) {
    this.filteredFiles = Array.from(this.#searchMap.keys())
      .filter((file) => file.toLowerCase().includes(filterKey.toLowerCase()))
      .map((file) => ({ name: file, file: this.#searchMap.get(file)! }));
  }

  #getFragment(file: FileUnderTestModel | TestFileModel) {
    return (file as TestFileModel).tests === undefined ? '#mutant' : '#test';
  }
}
