import * as sinon from 'sinon';
import { MutationTestReportAppComponent } from '../../../src/components/mutation-test-report-app/mutation-test-report-app.component';
import { expect } from 'chai';
import { MutationTestReportFileComponent } from '../../../src/components/mutation-test-report-file/mutation-test-report-file.component';
import { CustomElementFixture } from '../helpers/CustomElementFixture';
import { createCustomEvent } from '../../../src/lib/custom-events';
import { MutationTestReportDrawerMutant } from '../../../src/components/mutation-test-report-drawer-mutant/mutation-test-report-drawer-mutant.component';
import { createMutantResult, createReport } from '../../helpers/factory';
import { MutantModel } from 'mutation-testing-metrics';

describe(MutationTestReportAppComponent.name, () => {
  let sut: CustomElementFixture<MutationTestReportAppComponent>;
  let fetchStub: sinon.SinonStub<[RequestInfo, RequestInit?], Promise<Response>>;
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
    it('should should fetch report data when updated', async () => {
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
      const redAlert = 'rgb(114, 28, 36)';
      const expectedError = new Error('report did not exist - 404');
      const expectedErrorMessage = 'Error: report did not exist - 404';
      fetchStub.rejects(expectedError);

      // Act
      sut.element.setAttribute('src', '/mutation-testing-report.json');
      await sut.whenStable();

      // Assert
      expect(sut.element.errorMessage).eq(expectedErrorMessage);
      const alert = sut.$('.alert');
      expect(alert.innerText).eq(expectedErrorMessage);
      expect(getColor(alert)).eq(redAlert);
    });
  });

  describe('report property', () => {
    it('should load the breadcrumb', async () => {
      sut.element.report = createReport();
      await sut.whenStable();
      expect(sut.$('mutation-test-report-breadcrumb')).ok;
    });

    it('should load the totals', async () => {
      sut.element.report = createReport();
      await sut.whenStable();
      expect(sut.$('mutation-test-report-totals')).ok;
    });

    it('should render a file when navigating to a file', async () => {
      // Arrange
      sut.element.report = createReport();
      await sut.whenStable();

      // Act
      window.location.hash = '#' + Object.keys(sut.element.report.files)[0];
      await tick(); // give routing a change (happens next tick)
      await sut.whenStable();

      // Assert
      const file = sut.$('mutation-test-report-file') as MutationTestReportFileComponent;
      expect(file).ok;
      expect(file.model).ok;
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
      sut.$('mutation-test-report-theme-switch').dispatchEvent(createCustomEvent('theme-switch', 'dark'));
      await sut.whenStable();

      // Assert
      expect(sut.element.theme).eq('dark');
      expect(localStorage.getItem('mutation-testing-elements-theme'), 'dark');
    });

    describe('themeBackgroundColor', () => {
      it('should show light theme-color on light theme', async () => {
        // Arrange
        sut.element.report = createReport();
        await sut.whenStable();

        expect(sut.element.themeBackgroundColor).eq('#fff');
      });

      it('should show dark theme-color on dark theme', async () => {
        // Arrange
        sut.element.report = createReport();
        sut.element.theme = 'dark';
        await sut.whenStable();

        expect(sut.element.themeBackgroundColor).eq('#18191a');
      });
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

    it('should trigger a `theme-selected` event when the theme changes', async () => {
      sut.element.report = createReport();
      await sut.whenStable();
      const event = await sut.catchCustomEvent('theme-changed', () => {
        sut.$('mutation-test-report-theme-switch').dispatchEvent(createCustomEvent('theme-switch', 'dark'));
      });
      expect(event?.detail.theme).eq('dark');
    });

    it('should trigger a `theme-selected` event when the theme changes during init', async () => {
      // Arrange
      const event = await sut.catchCustomEvent('theme-changed', async () => {
        matchMediaStub.returns({ matches: true } as MediaQueryList);
        sut.element.report = createReport();
        await sut.whenStable();
      });
      expect(event?.detail.theme).eq('dark');
    });
  });

  describe('the drawer', () => {
    beforeEach(async () => {
      sut.element.report = createReport();
      await sut.whenStable();
    });

    function selectDrawer() {
      return sut.$('mutation-test-report-drawer-mutant') as MutationTestReportDrawerMutant;
    }

    it('should be rendered closed to begin with', () => {
      expect(selectDrawer().mode).eq('closed');
    });

    it('should half open when a mutant is selected', async () => {
      // Arrange
      const mutant = new MutantModel(createMutantResult());
      const event = createCustomEvent('mutant-selected', { selected: true, mutant });
      window.location.hash = '#foobar.js';
      await tick();
      await sut.whenStable();

      // Act
      sut.$('mutation-test-report-file').dispatchEvent(event);
      await sut.whenStable();
      const drawer = selectDrawer();

      // Assert
      expect(drawer.mode).eq('half');
      expect(drawer.mutant).eq(mutant);
    });

    it('should close when a mutant is deselected', async () => {
      // Arrange
      const mutant = new MutantModel(createMutantResult());
      window.location.hash = '#foobar.js';
      await tick();
      await sut.whenStable();
      sut.$('mutation-test-report-file').dispatchEvent(createCustomEvent('mutant-selected', { selected: true, mutant }));
      const drawer = selectDrawer();
      await sut.whenStable();

      // Act
      sut.$('mutation-test-report-file').dispatchEvent(createCustomEvent('mutant-selected', { selected: false, mutant }));
      await sut.whenStable();

      // Assert
      expect(drawer.mode).eq('closed');
      expect(drawer.mutant).eq(mutant);
    });
  });

  function getColor(element: HTMLElement) {
    return getComputedStyle(element).color;
  }

  function tick() {
    return new Promise((res) => setTimeout(res, 0));
  }
});
