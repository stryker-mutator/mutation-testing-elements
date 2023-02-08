import * as sinon from 'sinon';
import { MutationTestReportAppComponent } from '../../../src/components/app/app.component';
import { expect } from 'chai';
import { CustomElementFixture } from '../helpers/CustomElementFixture';
import { createCustomEvent } from '../../../src/lib/custom-events';
import { createReport } from '../../helpers/factory';
import { MutationTestReportMutantViewComponent } from '../../../src/components/mutant-view/mutant-view';
import { MutationTestReportTestViewComponent } from '../../../src/components/test-view/test-view';
import { tick } from '../helpers/tick';

describe(MutationTestReportAppComponent.name, () => {
  let sut: CustomElementFixture<MutationTestReportAppComponent>;
  let fetchStub: sinon.SinonStub<[URL | RequestInfo, RequestInit?], Promise<Response>>;
  let matchMediaStub: sinon.SinonStub<[query: string], MediaQueryList>;

  beforeEach(() => {
    fetchStub = sinon.stub(window, 'fetch');
    matchMediaStub = sinon.stub(window, 'matchMedia');
    matchMediaStub.returns({ matches: false } as MediaQueryList);
    sut = new CustomElementFixture('mutation-test-report-app');
  });

  afterEach(() => {
    window.location.hash = '';
    sut.dispose();
    localStorage.clear();
  });

  describe('the title', () => {
    it('should not change without a report', () => {
      expect(document.title).eq('');
    });

    it('should change when a report is set', async () => {
      sut.element.report = createReport();
      await sut.whenStable();
      expect(document.title).eq('All files');
    });

    it('should respect the "title-postfix" attribute', async () => {
      sut.element.setAttribute('title-postfix', 'Stryker report');
      sut.element.report = createReport();
      await sut.whenStable();
      expect(document.title).eq('All files - Stryker report');
    });
  });

  describe('`src` attribute', () => {
    it('should fetch report data when updated', async () => {
      // Arrange
      const response: Pick<Response, 'json'> = {
        json: () => Promise.resolve(expectedReport),
      };
      const expectedReport = createReport();
      fetchStub.resolves(response as Response);

      // Act
      sut.element.setAttribute('src', '/mutation-testing-report.json');
      await sut.whenStable(); // await window.fetch

      // Assert
      expect(sut.element.report).eq(expectedReport);
      expect(fetchStub).calledWith('/mutation-testing-report.json');
    });

    it('should report error when fetch fails', async () => {
      // Arrange
      const redAlert = 'rgb(185, 28, 28)';
      const expectedError = new Error('report did not exist - 404');
      const expectedErrorMessage = 'Error: report did not exist - 404';
      fetchStub.rejects(expectedError);

      // Act
      sut.element.setAttribute('src', '/mutation-testing-report.json');
      await sut.whenStable();

      // Assert
      expect(sut.element.errorMessage).eq(expectedErrorMessage);
      const alert: HTMLElement = sut.$('[role=alert]');
      expect(alert.innerText).eq(expectedErrorMessage);
      expect(getColor(alert)).eq(redAlert);
    });
  });

  describe('`report` property', () => {
    it('should load the breadcrumb', async () => {
      sut.element.report = createReport();
      await sut.whenStable();
      expect(sut.$('mte-breadcrumb')).ok;
    });

    it('should load mutant view by default', async () => {
      sut.element.report = createReport();
      await sut.whenStable();
      expect(sut.$('mte-mutant-view')).ok;
    });

    it('should load navigation when testFiles are present', async () => {
      sut.element.report = createReport({
        testFiles: {
          'foobar.spec.js': {
            tests: [],
          },
        },
      });
      await sut.whenStable();
      expect(sut.$('nav')).ok;
    });

    it('should not load navigation if testFiles object is empty', async () => {
      sut.element.report = createReport({
        testFiles: {},
      });
      await sut.whenStable();
      expect(sut.$('nav')).null;
    });
  });

  describe('on locationChanged', () => {
    it('should pass the correct mutantResult to the mutant view', async () => {
      // Arrange
      sut.element.report = createReport({
        files: {
          'foobar.js': {
            language: 'javascript',
            mutants: [],
            source: 'foo = "bar";',
          },
        },
      });
      await sut.whenStable();

      // Act
      window.location.hash = '#mutant/foobar.js';
      await tick(); // give routing a change (happens next tick)
      await sut.whenStable();

      // Assert
      const file: MutationTestReportMutantViewComponent = sut.$('mte-mutant-view');
      expect(file).ok;
      expect(file.result.file!.name).eq('foobar.js');
    });

    it('should pass the correct testResult to the test view', async () => {
      // Arrange
      sut.element.report = createReport({
        testFiles: {
          'foobar.spec.js': {
            tests: [],
          },
        },
      });
      await sut.whenStable();

      // Act
      window.location.hash = '#test/foobar.spec.js';
      await tick(); // give routing a change (happens next tick)
      await sut.whenStable();

      // Assert
      const file: MutationTestReportTestViewComponent = sut.$('mte-test-view');
      expect(file).ok;
      expect(file.result.file!.name).eq('foobar.spec.js');
    });
  });

  describe('theme property', () => {
    it('should have default theme light', async () => {
      // Arrange
      sut.element.report = createReport();
      await sut.whenStable();

      expect(sut.element.theme).eq('light');
    });

    it('should get theme from local storage', async () => {
      // Act
      localStorage.setItem('mutation-testing-elements-theme', 'dark');

      // Arrange
      sut.element.report = createReport();
      await sut.whenStable();

      // Assert
      expect(sut.element.theme).eq('dark');
    });

    it('should set theme to local storage', async () => {
      // Arrange
      sut.element.report = createReport();
      await sut.whenStable();

      // Act
      sut.$('mte-theme-switch').dispatchEvent(createCustomEvent('theme-switch', 'dark'));
      await sut.whenStable();

      // Assert
      expect(sut.element.theme).eq('dark');
      expect(localStorage.getItem('mutation-testing-elements-theme'), 'dark');
    });

    it('should not set theme to local storage if localStorage is not available', async () => {
      // Arrange
      sut.element.report = createReport();
      const setItemStub = sinon.stub(localStorage, 'setItem').throws(new Error());
      await sut.whenStable();

      // Act
      sut.$('mte-theme-switch').dispatchEvent(createCustomEvent('theme-switch', 'dark'));
      await sut.whenStable();

      // Assert
      expect(sut.element.theme).eq('dark');
      expect(setItemStub.notCalled).false;
    });

    describe('themeBackgroundColor', () => {
      it('should show light theme-color on light theme', async () => {
        // Arrange
        sut.element.report = createReport();
        await sut.whenStable();

        expect(sut.element.themeBackgroundColor).eq(' #fff');
      });

      it('should show dark theme-color on dark theme', async () => {
        // Arrange
        sut.element.report = createReport();
        sut.element.theme = 'dark';
        await sut.whenStable();

        expect(sut.element.themeBackgroundColor).eq(' #18181b');
      });
    });

    it('should use fallbacks if localStorage is not available', async () => {
      sinon.stub(localStorage, 'setItem').throws(new Error());
      matchMediaStub.withArgs('(prefers-color-scheme: dark)').returns({ matches: true } as MediaQueryList);
      sut.element.report = createReport();
      await sut.whenStable();

      // Assert
      expect(sut.element.theme).eq('dark');
    });

    it('should choose attribute value over local storage', async () => {
      // Arrange
      localStorage.setItem('mutation-testing-elements-theme', 'dark');
      sut.element.theme = 'light';
      sut.element.report = createReport();
      await sut.whenStable();

      // Assert
      expect(sut.element.theme).eq('light');
    });

    it('should use user prefers dark (os preference)', async () => {
      // Arrange
      matchMediaStub.returns({ matches: true } as MediaQueryList);
      sut.element.report = createReport();
      await sut.whenStable();

      // Assert
      expect(sut.element.theme).eq('dark');
    });

    it('should use local storage over user prefers dark', async () => {
      // Arrange
      matchMediaStub.withArgs('(prefers-color-scheme: dark)').returns({ matches: false } as MediaQueryList);
      localStorage.setItem('mutation-testing-elements-theme', 'dark');
      sut.element.report = createReport();
      await sut.whenStable();

      // Assert
      expect(sut.element.theme).eq('dark');
    });

    it('should trigger a `theme-changed` event when the theme changes', async () => {
      sut.element.report = createReport();
      await sut.whenStable();
      const event = await sut.catchCustomEvent('theme-changed', () => {
        sut.$('mte-theme-switch').dispatchEvent(createCustomEvent('theme-switch', 'dark'));
      });
      expect(event?.detail.theme).eq('dark');
      expect(event?.detail.themeBackgroundColor).eq(' #18181b');
    });

    it('should trigger a `theme-changed` event when the theme changes during init', async () => {
      // Arrange
      const event = await sut.catchCustomEvent('theme-changed', async () => {
        matchMediaStub.returns({ matches: true } as MediaQueryList);
        sut.element.report = createReport();
        await sut.whenStable();
      });
      expect(event?.detail.theme).eq('dark');
      expect(event?.detail.themeBackgroundColor).eq(' #18181b');
    });
  });

  function getColor(element: HTMLElement) {
    return getComputedStyle(element).color;
  }
});
