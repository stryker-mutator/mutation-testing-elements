import { MutationTestReportAppComponent } from '../../../src/components/mutation-test-report-app';
import { expect } from 'chai';
import { MutationTestResult } from 'mutation-testing-report-schema';
import * as sinon from 'sinon';
import { MutationTestReportFileComponent } from '../../../src/components/mutation-test-report-file';
import { CustomElementFixture } from '../helpers/CustomElementFixture';

describe(MutationTestReportAppComponent.name, () => {
  let sut: CustomElementFixture<MutationTestReportAppComponent>;
  let fetchStub: sinon.SinonStub<[RequestInfo, RequestInit?], Promise<Response>>;

  beforeEach(() => {
    fetchStub = sinon.stub(window, 'fetch');
    sut = new CustomElementFixture('mutation-test-report-app');
  });

  afterEach(() => {
    window.location.hash = '';
  });

  function createReport(): MutationTestResult {
    return {
      files: {
        'foobar.js': {
          language: 'javascript',
          mutants: [],
          source: 'foo = "bar";'
        }
      },
      schemaVersion: '1.0',
      thresholds: {
        high: 80,
        low: 60
      }
    };
  }

  afterEach(() => {
    sut.dispose();
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
        json: () => Promise.resolve(expectedReport)
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

  function getColor(element: HTMLElement) {
    return getComputedStyle(element).color;
  }

  function tick() {
    return new Promise(res => setTimeout(res, 0));
  }
});
