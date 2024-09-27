import { html, LitElement, nothing, } from "lit";
import { map } from 'lit/directives/map.js';
import { customElement, property, state } from "lit/decorators.js";
import { tailwind } from "../../style/index.js";
import type { FileUnderTestModel, Metrics, MetricsResult, MutationTestMetricsResult} from "mutation-testing-metrics";
import { classMap } from "lit/directives/class-map.js";
import { renderIf } from "../../lib/html-helpers.js";

@customElement('mte-file-picker')
export class MutationTestReportFilePickerComponent extends LitElement {
  static styles = [tailwind];

  #currentPressedKeys = new Set<string>();
  #searchMap = new Map<string, FileUnderTestModel>();

  @property({ type: Object })
  public declare rootModel: MutationTestMetricsResult;

  @state()
  public declare openPicker: boolean;

  @state()
  public declare filteredFiles: { name: string, file: FileUnderTestModel }[];

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

    document.addEventListener('keydown', (e) => this.#handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.#handleKeyUp(e));
    document.addEventListener('mte-file-picker-open', () => this.#togglePicker());
  }

  render() {
    if (!this.openPicker) {
      return nothing;
    }

    return html`
      <div id="backdrop" @click="${() => this.#closePicker()}" class="fixed flex justify-center top-0 left-0 h-full w-full bg-black/50 backdrop-blur-lg z-50">
        <div @click="${(e: MouseEvent) => e.stopPropagation()}" role="dialog" id="picker" class="flex flex-col bg-gray-200/60 backdrop-blur-lg h-full h-fit max-h-[500px] w-full md:w-1/2 max-w-[40rem] rounded-lg p-4 m-4">
          <div class="flex items-center mb-2 p-2 rounded bg-gray-200/60 backdrop-blur-lg">
            <div class="flex items-center mx-2 text-gray-800">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <input
              id="file-picker-input"
              @keyup="${(e: KeyboardEvent) => this.#handleSearch(e)}" 
              type="text"
              style="box-shadow: none"
              class="mr-2 w-full text-gray-800 bg-transparent border-transparent border-0 focus:shadow-none rounded" placeholder="Search for a file" />
          </div>
          <div tabindex="-1" class="overflow-auto">
            ${this.#renderFoundFiles()}
          </div>
        </div>
      </div>
    `;
  }

  #renderFoundFiles() {
    return html`
      <ul id="files" class="flex flex-col">
        ${renderIf(this.filteredFiles.length === 0, () => html`<li class="text-gray-800">No files found</li>`)}
        ${map(this.filteredFiles, ({ name, file }, index) => {
          return html`
            <li>
              <a 
                ?data-active="${index === this.fileIndex}"
                tabindex="${index === this.fileIndex ? 0 : -1}"
                @focusout="${() => this.#handleFocus()}"
                @click="${() => this.#closePicker()}"
                class="flex border-2 border-black bg-black rounded p-1 px-2 my-1 text-gray-800 focus-visible:border-primary-200 outline-none ${classMap({ 'border-primary-500': index === this.fileIndex })}"  
                href="#mutant/${name}"
              >
                ${file.result?.name}<span class="mx-2">•</span><span class="text-gray-400">${name}</span>
              </a>
            </li>`
        })}
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
    
    const prepareFiles = (result: MetricsResult<FileUnderTestModel, Metrics>, parentPath: string | null = null) => {
      if (result.file != null) {
        this.#searchMap.set(parentPath == null ? result.name : `${parentPath}/${result.name}`, result.file);
      }

      result.childResults.forEach((child) => {
        if ((parentPath !== 'All files' && parentPath !== null) && result.name !== null) {
          prepareFiles(child, `${parentPath}/${result.name}`);
        }
        else if ((parentPath === 'All files' || parentPath === null) && result.name !== "All files") {
          prepareFiles(child, result.name);
        }
        else {
          prepareFiles(child);
        }
      });
    }

    prepareFiles(this.rootModel.systemUnderTestMetrics);
  }

  #handleKeyDown(event: KeyboardEvent) {
    this.#currentPressedKeys.add(event.key);

    if ((this.#currentPressedKeys.has('Control') && this.#currentPressedKeys.has('k'))) {
      this.#togglePicker(event);
    }

    if (!this.openPicker && this.#currentPressedKeys.has('/')) {
      this.#togglePicker(event);
    }

    if (this.#currentPressedKeys.has('Escape')) {
      this.#closePicker();
    }


    if (this.#currentPressedKeys.has('ArrowUp')) {
      this.#handleArrowUp();
    }

    if (this.#currentPressedKeys.has('ArrowDown')) {
      this.#handleArrowDown();
    }

    if (this.#currentPressedKeys.has('ArrowUp') || this.#currentPressedKeys.has('ArrowDown')) {
      setTimeout(() => {
        this.#scrollActiveLinkInView();
      });
    }

    if (this.#currentPressedKeys.has('Enter')) {
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
    window.location.hash = `#mutant/${this.filteredFiles[this.fileIndex].name}`;
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

    setTimeout(() => {
      this.#focusInput();
    }, 10);
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
  
  #handleKeyUp(event: KeyboardEvent) {
    this.#currentPressedKeys.delete(event.key);
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
      .filter((file) => file.includes(filterKey))
      .map((file) => ({ name: file, file: this.#searchMap.get(file)! }));
  }
}
