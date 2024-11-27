import { MutationTestReportFileIconComponent } from '../../../src/components/file-icon/file-icon.component.js';
import { ProgrammingLanguage } from '../../../src/lib/code-helpers.js';
import { CustomElementFixture } from '../helpers/CustomElementFixture.js';

describe(MutationTestReportFileIconComponent.name, () => {
  let sut: CustomElementFixture<MutationTestReportFileIconComponent>;

  beforeEach(() => {
    sut = new CustomElementFixture('mte-file-icon', { autoConnect: false });
  });

  it('should show a directory svg for directories', async () => {
    // Arrange
    // no file attribute
    sut.element.setAttribute('file-name', 'dir');

    // Act
    sut.connect();
    await sut.whenStable();

    // Assert
    expectSvgClass('octicon-file-directory');
  });

  it('should show a generic file svg for unknown files', async () => {
    // Arrange
    sut.element.setAttribute('file', '');
    sut.element.setAttribute('file-name', 'un-support.ed');

    // Act
    sut.connect();
    await sut.whenStable();

    // Assert
    expectSvgClass('octicon-file');
  });

  it.each([
    [ProgrammingLanguage.csharp, 'cs'],
    [ProgrammingLanguage.html, 'html'],
    [ProgrammingLanguage.java, 'java'],
    [ProgrammingLanguage.javascript, 'js'],
    [ProgrammingLanguage.javascript, 'cjs'],
    [ProgrammingLanguage.javascript, 'mjs'],
    [ProgrammingLanguage.typescript, 'ts'],
    [ProgrammingLanguage.typescript, 'tsx'],
    [ProgrammingLanguage.scala, 'scala'],
    [ProgrammingLanguage.php, 'php'],
    [ProgrammingLanguage.vue, 'vue'],
    [ProgrammingLanguage.svelte, 'svelte'],
    [ProgrammingLanguage.rust, 'rs'],
  ])(`should choose show a %s svg file for foo.%s`, async (expected, extension) => {
    // Arrange
    sut.element.setAttribute('file', '');
    sut.element.setAttribute('file-name', `foo.${extension}`);

    // Act
    sut.connect();
    await sut.whenStable();

    // Assert
    expectSvgClass(expected);
    expectNotSvgClass('test');
  });

  it('should show a test svg when file basename ends with "spec"', async () => {
    // Arrange
    sut.element.setAttribute('file', '');
    sut.element.setAttribute('file-name', `foo.spec.ts`);

    // Act
    sut.connect();
    await sut.whenStable();

    // Assert
    expectSvgClass('test');
  });

  it('should show a test svg when file basename ends with "test"', async () => {
    // Arrange
    sut.element.setAttribute('file', '');
    sut.element.setAttribute('file-name', `foo.test.ts`);

    // Act
    sut.connect();
    await sut.whenStable();

    // Assert
    expectSvgClass('test');
  });

  function expectSvgClass(expectedClass: string) {
    expect([...sut.$('svg').classList]).includes(expectedClass);
  }
  function expectNotSvgClass(notExpectedClass: string) {
    expect([...sut.$('svg').classList]).not.includes(notExpectedClass);
  }
});
