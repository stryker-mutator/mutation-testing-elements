import { calculateMutationTestMetrics } from 'mutation-testing-metrics';
import { MutationTestReportFilePickerComponent } from '../../../src/components/file-picker/file-picker.component.js';
import { CustomElementFixture } from '../helpers/CustomElementFixture.js';
import { createReport } from '../helpers/factory.js';
import { tick } from '../helpers/tick.js';

describe(MutationTestReportFilePickerComponent.name, () => {
  let sut: CustomElementFixture<MutationTestReportFilePickerComponent>;

  beforeEach(() => {
    sut = new CustomElementFixture('mte-file-picker', { autoConnect: false });
  });

  it('should not show the file picker by default', async () => {
    // Arrange
    sut.element.rootModel = calculateMutationTestMetrics(createReport());

    // Act
    sut.connect();
    await sut.whenStable();

    // Assert
    expect(sut.element.shadowRoot?.querySelector('#picker')).to.eq(null);
  });

  it('should show the picker when keycombo is pressed', async () => {
    // Arrange
    sut.element.rootModel = calculateMutationTestMetrics(createReport());

    // Act
    sut.connect();
    await sut.whenStable();
    await openPicker();

    // Assert
    expect(sut.element.shadowRoot?.querySelector('#picker')).toBeVisible();
  });

  describe('when the picker is open', () => {
    beforeEach(async () => {
      sut.element.rootModel = calculateMutationTestMetrics(
        createReport({
          files: {
            'src/index.ts': { language: 'typescript', mutants: [], source: '' },
            'src/index.html': { language: 'html', mutants: [], source: '' },
            'src/append.js': { language: 'javascript', mutants: [], source: '' },
          },
        }),
      );
      sut.connect();
      await sut.whenStable();
      await openPicker();
    });

    it('should close the picker when the keycombo is pressed again', async () => {
      // Act
      await openPicker();

      // Assert
      expect(sut.element.shadowRoot?.querySelector('#picker')).to.eq(null);
    });

    it('should close the picker when the escape key is pressed', async () => {
      // Act
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await sut.whenStable();

      // Assert
      expect(sut.element.shadowRoot?.querySelector('#picker')).to.eq(null);
    });

    it('should close the picker when clicking outside the dialog', async () => {
      // Act
      const backdrop = sut.element.shadowRoot?.querySelector('#backdrop');
      (backdrop as HTMLElement).click();
      await sut.whenStable();

      // Assert
      expect(sut.element.shadowRoot?.querySelector('#picker')).to.eq(null);
    });

    describe('when not typing in the search box', () => {
      it('should select the first item', async () => {
        // Arrange & Act
        await sut.whenStable();

        // Assert
        expect(sut.element.shadowRoot?.querySelector('a[data-active]')?.textContent?.trim()).include('append.js');
      });
    });

    describe('when typing in the search box', () => {
      it('should select the first item when searching with the letter "i"', async () => {
        // Arrange
        const input = sut.element.shadowRoot?.querySelector('#file-picker-input');

        // Act
        (input as HTMLInputElement).value = 'i';
        input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'i' }));
        input?.dispatchEvent(new KeyboardEvent('keyup', { key: 'i' }));
        await sut.whenStable();

        // Assert
        expect(sut.element.shadowRoot?.querySelector('a[data-active]')?.textContent?.trim()).include('index.html');
      });

      it('should redirect to mutant when pressing enter', async () => {
        // Arrange
        const input = sut.element.shadowRoot?.querySelector('#file-picker-input');
        (input as HTMLInputElement).value = 'index.html';
        input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'l' }));
        input?.dispatchEvent(new KeyboardEvent('keyup', { key: 'l' }));
        await sut.whenStable();

        // Act
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        await sut.whenStable();

        // Assert
        expect(window.location.hash).to.eq('#mutant/index.html');
      });
    });

    describe('when pressing the arrow keys', () => {
      beforeEach(() => {
        const input = sut.element.shadowRoot?.querySelector('#file-picker-input');
        (input as HTMLInputElement).value = '';
      });

      it('should move active item to the next item when pressing down', async () => {
        // Arrange & Act
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        document.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown' }));
        await sut.whenStable();
        await tick();

        // Assert
        expect(sut.element.shadowRoot?.querySelector('a[data-active]')?.textContent?.trim()).include('index.html');
      });

      it('should move to the first item when pressing down on the last item', async () => {
        // Arrange & Act
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        await sut.whenStable();

        // Assert
        expect(sut.element.shadowRoot?.querySelector('a[data-active]')?.textContent?.trim()).include('append.js');
      });

      it('should move active item to the previous item when pressing up', async () => {
        // Arrange & Act
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        document.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown' }));

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        document.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown' }));

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        document.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' }));

        await sut.whenStable();

        // Assert
        expect(sut.element.shadowRoot?.querySelector('a[data-active]')?.textContent?.trim()).include('index.html');
      });

      it('should move to the last item when pressing up on the first item', async () => {
        // Arrange
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        document.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' }));
        await sut.whenStable();

        // Act
        await sut.whenStable();

        // Assert
        expect(sut.element.shadowRoot?.querySelector('a[data-active]')?.textContent?.trim()).include('index.ts');
      });
    });
  });

  async function openPicker() {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }));
    await sut.whenStable();

    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Control' }));
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'k' }));
    await sut.whenStable();
  }
});
