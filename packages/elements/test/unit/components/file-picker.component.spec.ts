import { calculateMutationTestMetrics } from 'mutation-testing-metrics';
import { userEvent } from 'vitest/browser';

import { MutationTestReportFilePickerComponent } from '../../../src/components/file-picker/file-picker.component.js';
import { CustomElementFixture } from '../helpers/CustomElementFixture.js';
import { createReport } from '../helpers/factory.js';

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
    expect(getPicker()).not.toBeVisible();
  });

  it('should show the picker when keycombo is pressed', async () => {
    // Arrange
    sut.element.rootModel = calculateMutationTestMetrics(createReport());

    // Act
    sut.connect();
    await sut.whenStable();
    await openPicker();

    // Assert
    expect(getPicker()).toBeVisible();
  });

  it('should show the picker when macos keycombo is pressed', async () => {
    // Arrange
    sut.element.rootModel = calculateMutationTestMetrics(createReport());

    // Act
    sut.connect();
    await sut.whenStable();
    await userEvent.keyboard('{Meta>}{k}');
    await sut.whenStable();

    // Assert
    expect(getPicker()).toBeVisible();
  });

  it('should show the picker when / is pressed', async () => {
    // Arrange
    sut.element.rootModel = calculateMutationTestMetrics(createReport());

    // Act
    sut.connect();
    await userEvent.keyboard('/');
    await sut.whenStable();

    // Assert
    expect(getPicker()).toBeVisible();
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
      expect(getPicker()).not.toBeVisible();
    });

    it('should close the picker when the escape key is pressed', async () => {
      // Act
      await userEvent.keyboard('{Escape}');
      await sut.whenStable();

      // Assert
      expect(getPicker()).not.toBeVisible();
    });

    it('should close the picker when clicking outside the dialog', async () => {
      // Act
      const backdrop = sut.$('dialog');
      backdrop.click();
      await sut.whenStable();

      // Assert
      expect(getPicker()).not.toBeVisible();
    });

    describe('when not typing in the search box', () => {
      it('should select the first item', async () => {
        // Arrange & Act
        await sut.whenStable();

        // Assert
        expect(getActiveItem()).toHaveTextContent('append.js');
        expect(sut.$$('#files li')).toHaveLength(3);
        expect(sut.$('#files')).not.toHaveTextContent('No files found');
      });
    });

    describe('when typing in the search box', () => {
      it('should select the first item when searching with the letter "i"', async () => {
        // Arrange
        const input = getFilePickerInput();

        // Act
        await userEvent.fill(input, 'i');
        await sut.whenStable();

        // Assert
        expect(getActiveItem()).toHaveTextContent('index.ts');
      });

      it('should redirect to mutant when pressing enter', async () => {
        // Arrange
        const input = getFilePickerInput();
        await userEvent.fill(input, 'l');
        await sut.whenStable();

        // Act
        await userEvent.keyboard('{enter}');
        await sut.whenStable();

        // Assert
        expect(window.location.hash).to.eq('#mutant/index.html');
      });

      it('should support fuzzy-search', async () => {
        // Arrange
        const input = getFilePickerInput();

        // Ac
        await userEvent.fill(input, 'indx.hml');
        await sut.whenStable();

        // Assert
        expect(getActiveItem()).toHaveTextContent('index.html');
      });

      it('should show when no files are found', async () => {
        // Arrange
        const input = getFilePickerInput();

        // Act
        await userEvent.fill(input, 'non-existing-file');
        await sut.whenStable();

        // Assert
        expect(getActiveItem()).not.toBeInTheDocument();
        expect(sut.$('#files')).toHaveTextContent('No files found');
        expect(sut.$$('#files')).toHaveLength(1);
      });
    });

    describe('when pressing the arrow keys', () => {
      it('should move active item to the next item when pressing down', async () => {
        // Arrange & Act
        await userEvent.keyboard('{arrowdown}');
        await sut.whenStable();

        // Assert
        expect(getActiveItem()).toHaveTextContent('index.html');
      });

      it('should move to the first item when pressing down on the last item', async () => {
        // Arrange & Act
        await userEvent.keyboard('{arrowdown}');
        await userEvent.keyboard('{arrowdown}');
        await userEvent.keyboard('{arrowdown}');
        await sut.whenStable();

        // Assert
        expect(getActiveItem()).toHaveTextContent('append.js');
      });

      it('should move active item to the previous item when pressing up', async () => {
        // Arrange & Act
        await userEvent.keyboard('{arrowdown}');
        await userEvent.keyboard('{arrowdown}');
        await userEvent.keyboard('{arrowup}');

        await sut.whenStable();

        // Assert
        expect(getActiveItem()).toHaveTextContent('index.html');
      });

      it('should move to the last item when pressing up on the first item', async () => {
        // Arrange
        await userEvent.keyboard('{arrowup}');
        await sut.whenStable();

        // Act
        await sut.whenStable();

        // Assert
        expect(getActiveItem()).toHaveTextContent('index.ts');
      });
    });
  });

  async function openPicker() {
    await userEvent.keyboard('{Control>}{k}');
    await sut.whenStable();
  }

  function getPicker() {
    return sut.$<HTMLDialogElement>('dialog');
  }

  function getActiveItem() {
    return sut.$<HTMLAnchorElement>('[aria-selected="true"] a');
  }

  function getFilePickerInput() {
    return sut.$<HTMLInputElement>('input');
  }
});
