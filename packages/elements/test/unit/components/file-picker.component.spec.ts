import { MutationTestReportFilePickerComponent } from '../../../src/components/file-picker/file-picker.component.js';
import { CustomElementFixture } from "../helpers/CustomElementFixture.js";

describe(MutationTestReportFilePickerComponent.name, () => {
  let sut: CustomElementFixture<MutationTestReportFilePickerComponent>;

  beforeEach(() => {
    sut = new CustomElementFixture('mte-file-picker', { autoConnect: false });
  });

  it('should not show the picker when openPicker is false', async () => {
    // Arrange
    sut.element.setAttribute('open-picker', 'false');

    // Act
    sut.connect();
    await sut.whenStable();

    // Assert
    expect(sut.element).toBeVisible();
  });

  it('should show the picker when openPicker is true', async () => {
    // Arrange
    sut.element.setAttribute('open-picker', 'true');

    // Act
    sut.connect();
    await sut.whenStable();

    // Assert
    expect(sut.element).toBeVisible();
  });
});
