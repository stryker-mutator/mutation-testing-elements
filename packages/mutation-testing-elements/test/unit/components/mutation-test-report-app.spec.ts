import '../../../src';
import { MutationTestReportAppComponent } from '../../../src/components/mutation-test-report-app';
import { expect } from 'chai';
import { MutationTestResult } from 'mutation-testing-report-schema';
import * as sinon from 'sinon';
import { MutationTestReportFileComponent } from '../../../src/components/mutation-test-report-file';

describe(MutationTestReportAppComponent.name, () => {
  let sut: MutationTestReportAppComponent;
  let fetchStub: sinon.SinonStub;

  beforeEach(() => {
    window.location.hash = '';
    fetchStub = sinon.stub(window, 'fetch');
  });

  function createSut() {
    sut = document.createElement('mutation-test-report-app') as MutationTestReportAppComponent;
    document.body.append(sut);
    return sut;
  }

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
    if (sut) {
      sut.remove();
    }
  });

  it('should not change the title without a report', () => {
    const title = document.title;
    createSut();
    expect(document.title).eq(title);
  });

  it('should change the title when a report is set', async () => {
    sut = createSut();
    sut.report = createReport();
    await sut.updateComplete;
    expect(document.title).eq('All files');
  });

  it('should respect the "title-postfix" attribute', async () => {
    sut = createSut();
    sut.setAttribute('title-postfix', 'Stryker report');
    sut.report = createReport();
    await sut.updateComplete;
    expect(document.title).eq('All files - Stryker report');
  });

  it('should should fetch report data when `src` is set', async () => {
    // Arrange
    const expectedReport = createReport();
    fetchStub.resolves({
      json: () => Promise.resolve(expectedReport)
    });
    sut = createSut();

    // Act
    sut.setAttribute('src', '/mutation-testing-report.json');
    await sut.updateComplete; // await window.fetch
    await sut.updateComplete; // await response.json
    await sut.updateComplete; // await updated

    // Assert
    expect(sut.report).eq(expectedReport);
    expect(fetchStub).calledWith('/mutation-testing-report.json');
  });

  it('should report error when fetch fails', async () => {
    // Arrange
    const redAlert = 'rgb(114, 28, 36)';
    const expectedError = new Error('report did not exist - 404');
    const expectedErrorMessage = 'Error: report did not exist - 404';
    fetchStub.rejects(expectedError);
    sut = createSut();

    // Act
    sut.setAttribute('src', '/mutation-testing-report.json');
    await sut.updateComplete;
    await sut.updateComplete;
    await sut.updateComplete;

    // Assert
    expect(sut.errorMessage).eq(expectedErrorMessage);
    const alert = $('.alert');
    expect(alert.innerText).eq(expectedErrorMessage);
    expect(getColor(alert)).eq(redAlert);
  });

  it('should load the breadcrumb', async () => {
    sut = createSut();
    sut.report = createReport();
    await sut.updateComplete;
    expect($('mutation-test-report-breadcrumb')).ok;
  });

  it('should load the breadcrumb', async () => {
    sut = createSut();
    sut.report = createReport();
    await sut.updateComplete;
    expect($('mutation-test-report-totals')).ok;
  });

  it('should render a file when navigating to a file', async () => {
    // Arrange
    sut = createSut();
    sut.report = createReport();
    await sut.updateComplete;

    // Act
    window.location.hash = '#' + Object.keys(sut.report.files)[0];
    await tick(); // give routing a change (happens next tick)
    await sut.updateComplete;

    // Assert
    const file = $('mutation-test-report-file') as MutationTestReportFileComponent;
    expect(file).ok;
    expect(file.model.name).eq('foobar.js');
  });

  function getColor(element: HTMLElement) {
    return getComputedStyle(element).color;
  }

  function $(selector: string) {
    return ((sut.shadowRoot as ShadowRoot).querySelector(selector) as HTMLElement);
  }

  function tick() {
    return new Promise(res => setTimeout(res, 0));
  }
});
