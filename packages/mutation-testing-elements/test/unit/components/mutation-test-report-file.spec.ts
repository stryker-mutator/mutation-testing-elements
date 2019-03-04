import { CustomElementFixture } from '../helpers/CustomElementFixture';
import { MutationTestReportFileComponent } from '../../../src/components/mutation-test-report-file';
import { expect } from 'chai';
import { createFileResult } from '../model/index.spec';
import { FileResultModel } from '../../../src/model';
import { FileResult } from 'mutation-testing-report-schema';

describe(MutationTestReportFileComponent.name, () => {
  let sut: CustomElementFixture<MutationTestReportFileComponent>;
  let fileResult: FileResult;

  beforeEach(async () => {
    fileResult = createFileResult();
    sut = new CustomElementFixture('mutation-test-report-file');
    sut.element.model = new FileResultModel('foo.js', 'foo.js', fileResult);
    await sut.updateComplete;
  });

  afterEach(() => {
    sut.dispose();
  });

  it('should show the code', async () => {
    await sut.updateComplete;
    expect(sut.$('code').textContent).eq(fileResult.source);
  });

  it('should highlight the code', async () => {
    await sut.updateComplete;
    expect(sut.$('code .hljs-keyword')).ok;
  });
});
