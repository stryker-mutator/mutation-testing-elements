import { html, LitElement, nothing, } from "lit";
import { map } from 'lit/directives/map.js';
import { customElement, property, state } from "lit/decorators.js";
import { tailwind } from "../../style/index.js";
import { FileUnderTestModel, Metrics, MetricsResult, MutationTestMetricsResult, TestFileModel, TestMetrics } from "mutation-testing-metrics";

@customElement('mte-file-picker')
export class MutationTestReportFilePickerComponent extends LitElement {
  static styles = [tailwind];

  #currentPressedKeys = new Set<string>();
  #searchMap = new Map<string, string>();

  @property({ type: Object })
  public declare rootModel: MutationTestMetricsResult;

  @state()
  public declare openPicker: boolean;

  @state()
  public declare filteredFiles: string[];

  constructor() {
    super();
    
    this.openPicker = false;
  }

  connectedCallback(): void {
    super.connectedCallback();

    this.#prepareMap();
    this.#filter('');

    document.addEventListener('keydown', (e) => this.#handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.#handleKeyUp(e));
  }

  render() {
    if (!this.openPicker) {
      return nothing;
    }

    return html`
      <div @click="${this.#closePicker}" class="fixed flex justify-center items-center top-0 left-0 h-full w-full bg-black/50 backdrop-blur-lg z-50">
        <div @click="${(e: MouseEvent) => e.stopPropagation()}" role="dialog" id="picker" class="flex flex-col bg-gray-200/60 backdrop-blur-lg h-full md:h-1/2 w-full md:w-1/2 max-w-[40rem] rounded-lg p-4 m-4">
          <div class="flex items-center mb-2 p-2 rounded bg-gray-200/60 backdrop-blur-lg">
            <div class="h-full flex items-center mx-2 text-gray-800">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <input 
              @keyup="${this.#handleSearch}" 
              type="text"
              style="box-shadow: none"
              class="mr-2 w-full text-gray-800 bg-transparent border-transparent border-0 focus:shadow-none rounded" placeholder="Search for a file" />
          </div>
          <div class="height-full overflow-auto">
            ${this.#renderFoundFiles()}
          </div>
        </div>
      </div>
    `;
  }

  #renderFoundFiles() {
    return html`
      <ul class="flex flex-col">
        ${map(this.filteredFiles, (file) => {
          return html`
            <li>
              <a class="flex border-2 border-black bg-black rounded p-1 my-1 text-gray-800 focus-visible:border-primary-500 outline-none" @click="${this.#closePicker}" href="#mutant/${file}">${file}</a>
            </li>`
        })}
      </ul>
    `;
  }

  #prepareMap() {
    const prepareFiles = (result: MetricsResult<FileUnderTestModel, Metrics>, parentPath: string | null = null) => {
      if (result.file != null) {
        this.#searchMap.set(parentPath == null ? result.name : `${parentPath}/${result.name}`, '');
      }

      result.childResults.forEach((child) => {
        if (parentPath != null && parentPath !== 'All files') {
          prepareFiles(child, `${parentPath}/${result.name}`);
        }
        else {
          prepareFiles(child, result.name);
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
      this.openPicker = false;  
    }
  }

  #togglePicker(event: KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.openPicker = !this.openPicker;

    if (!this.openPicker) {
      document.body.style.overflow = 'auto';
    } else {
      document.body.style.overflow = 'hidden';
    }

    setTimeout(() => {
      this.shadowRoot?.querySelector('input')?.focus();
    }, 10);
  }

  #closePicker() {
    document.body.style.overflow = 'auto';
    this.openPicker = false;
    this.#filter('');
  }
  
  #handleKeyUp(event: KeyboardEvent) {
    this.#currentPressedKeys.delete(event.key);
  }

  #handleSearch(event: KeyboardEvent) {
    if (!this.openPicker) {
      return;
    }

    this.#filter((event.target as HTMLInputElement).value);
  }

  #filter(filterKey: string) {
    this.filteredFiles = Array.from(this.#searchMap.keys()).filter((file) => file.includes(filterKey));
  }
}
