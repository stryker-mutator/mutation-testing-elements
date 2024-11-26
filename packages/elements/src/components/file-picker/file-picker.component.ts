import fuzzysort from 'fuzzysort';
import type { TemplateResult } from 'lit';
import { html, LitElement, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import type { FileUnderTestModel, Metrics, MetricsResult, MutationTestMetricsResult, TestMetrics } from 'mutation-testing-metrics';
import { TestFileModel } from 'mutation-testing-metrics';

import { renderIf, toAbsoluteUrl } from '../../lib/html-helpers.js';
import { View } from '../../lib/router.js';
import { mutantFileIcon, searchIcon, testFileIcon } from '../../lib/svg-icons.js';
import { tailwind } from '../../style/index.js';

interface ModelEntry {
  name: string;
  file: FileUnderTestModel | TestFileModel;
}

@customElement('mte-file-picker')
export class MutationTestReportFilePickerComponent extends LitElement {
  static styles = [tailwind];

  #abortController = new AbortController();
  #searchTargets: (ModelEntry & { prepared: Fuzzysort.Prepared })[] = [];
  #originalDocumentOverflow = '';

  @property({ attribute: false })
  public declare rootModel: MutationTestMetricsResult | undefined;

  @state()
  public declare filteredFiles: (ModelEntry & { template?: (string | TemplateResult)[] })[];

  @state()
  public declare fileIndex: number;

  @query('dialog')
  private declare dialog: HTMLDialogElement;

  get isOpen() {
    return this.dialog.open;
  }

  constructor() {
    super();

    this.fileIndex = 0;
    this.filteredFiles = [];
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.#originalDocumentOverflow = document.body.style.overflow;

    window.addEventListener('keydown', this.#handleKeyDown, { signal: this.#abortController.signal });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    fuzzysort.cleanup();
    this.#abortController.abort();
  }

  willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('rootModel')) {
      this.#prepareMap();
      this.#filter('');
    }
  }

  open = () => {
    this.dialog.showModal();
  };

  close = () => {
    this.dialog.close();
  };

  render() {
    return html`
      <dialog
        @click="${this.close}"
        @close="${this.#handleClose}"
        @show="${this.#handleShow}"
        aria-labelledby="file-picker-label"
        class="my-4 max-w-[40rem] bg-transparent backdrop:bg-gray-950/50 backdrop:backdrop-blur-lg md:w-1/2"
      >
        <div
          @click="${(e: MouseEvent) => e.stopPropagation()}"
          class="mx-auto flex h-fit max-h-[33rem] flex-col rounded-lg bg-gray-200/60 p-4 backdrop-blur-lg"
        >
          <div class="mb-3 flex items-center rounded bg-gray-200/60 p-2 text-gray-800 shadow-lg">
            <div class="mx-2 flex items-center">${searchIcon}</div>
            <label id="file-picker-label" for="file-picker-input" class="sr-only">Search for a file</label>
            <input
              autocomplete="off"
              id="file-picker-input"
              @input="${this.#handleSearch}"
              type="search"
              style="box-shadow: none"
              class="mr-2 w-full border-0 border-transparent bg-transparent focus:shadow-none"
              placeholder="Search for a file (Ctrl-K)"
              aria-controls="files"
            />
          </div>
          ${this.#renderFoundFiles()}
        </div>
      </dialog>
    `;
  }

  #renderFoundFiles() {
    return html`
      <ul id="files" tabindex="-1" class="flex snap-y flex-col gap-2 overflow-auto" role="listbox" aria-labelledby="file-picker-label">
        ${renderIf(this.filteredFiles.length === 0, () => html`<li class="text-gray-800">No files found</li>`)}
        ${repeat(
          this.filteredFiles,
          (item) => item.name,
          ({ name, file, template }, index) => {
            const view = this.#getView(file);
            return html`
              <li
                class="group snap-start rounded bg-gray-200 text-gray-900 transition-shadow aria-selected:bg-primary-500 aria-selected:text-gray-50 aria-selected:shadow-lg"
                role="option"
                aria-selected="${index === this.fileIndex}"
              >
                <a
                  tabindex="${index === this.fileIndex ? 0 : -1}"
                  @click="${this.close}"
                  class="flex h-full flex-wrap items-center p-2 outline-none"
                  @mousemove="${() => (this.fileIndex = index)}"
                  href="${toAbsoluteUrl(view, name)}"
                >
                  <span class="inline-flex" title="File with ${view}s">${this.#renderTestOrMutantIndication(view)}</span>
                  <span class="ms-1">${file.result?.name}</span>
                  <span class="mx-2">•</span>
                  <span class="text-gray-400 group-aria-selected:text-gray-200">${template ?? name}</span>
                </a>
              </li>
            `;
          },
        )}
      </ul>
    `;
  }

  #renderTestOrMutantIndication(view: View) {
    return view === View.mutant ? mutantFileIcon : testFileIcon;
  }

  #prepareMap() {
    if (!this.rootModel) {
      return;
    }
    // Clear previous search targets
    this.#searchTargets = [];

    const prepareFiles = <T extends FileUnderTestModel | TestFileModel>(
      result: MetricsResult<T, Metrics | TestMetrics> | undefined,
      parentPath: string | null = null,
      allFilesKey: string,
    ) => {
      if (!result) {
        return;
      }

      if (result.file && result.name !== allFilesKey) {
        const name = !parentPath ? result.name : `${parentPath}/${result.name}`;
        this.#searchTargets.push({ name, file: result.file, prepared: fuzzysort.prepare(name) });
      }

      result.childResults.forEach((child) => {
        if (parentPath !== allFilesKey && parentPath && result.name) {
          prepareFiles(child, `${parentPath}/${result.name}`, allFilesKey);
        } else if ((parentPath === allFilesKey || !parentPath) && result.name !== allFilesKey) {
          prepareFiles(child, result.name, allFilesKey);
        } else {
          prepareFiles(child, null, allFilesKey);
        }
      });
    };

    prepareFiles(this.rootModel.systemUnderTestMetrics, null, 'All files');
    prepareFiles(this.rootModel.testMetrics, null, 'All tests');
  }

  #handleKeyDown = (event: KeyboardEvent) => {
    if (((event.ctrlKey || event.metaKey) && event.key === 'k') || (!this.isOpen && event.key === '/')) {
      this.#togglePicker(event);
    }

    if (!this.isOpen) {
      return;
    }

    if (event.key === 'ArrowUp') {
      this.#handleArrowUp();
    } else if (event.key === 'ArrowDown') {
      this.#handleArrowDown();
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      void this.updateComplete.then(() => {
        this.#scrollActiveLinkInView();
      });
    }

    if (event.key === 'Enter') {
      this.#handleEnter();
    }
  };

  #scrollActiveLinkInView() {
    const activeLink = this.renderRoot.querySelector('[aria-selected="true"] a');
    activeLink?.scrollIntoView({ block: 'nearest' });
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
    window.location.href = toAbsoluteUrl(this.#getView(entry.file), entry.name);
    this.close();
  }

  #togglePicker = (event: KeyboardEvent | null = null) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  };

  #handleClose = () => {
    this.fileIndex = 0;
    this.#filter('');
    document.body.style.overflow = this.#originalDocumentOverflow;
  };

  #handleShow = () => {
    document.body.style.overflow = 'hidden';
  };

  #handleSearch = (event: InputEvent) => {
    if (!this.isOpen) {
      return;
    }

    this.#filter((event.target as HTMLInputElement).value);
    this.fileIndex = 0;
  };

  #filter(filterKey: string) {
    if (!filterKey) {
      this.filteredFiles = this.#searchTargets;
    } else {
      this.filteredFiles = fuzzysort.go(filterKey, this.#searchTargets, { key: 'prepared', threshold: 0.3, limit: 500 }).map((result) => ({
        file: result.obj.file,
        name: result.obj.name,
        template: result.highlight(
          (m) => html`<mark class="bg-inherit text-primary-500 group-aria-selected:text-primary-50 group-aria-selected:underline">${m}</mark>`,
        ),
      }));
    }
  }

  #getView(file: FileUnderTestModel | TestFileModel): View {
    return file instanceof TestFileModel ? View.test : View.mutant;
  }
}
