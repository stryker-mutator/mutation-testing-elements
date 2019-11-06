import { SvgService } from '../../../src/components/svg';
import { expect } from 'chai';

describe(SvgService.name, () => {
  let sut: SvgService;

  beforeEach(() => {
    sut = new SvgService();
  });

  it('should get a directory svg icon', () => {
    const directoryIcon = sut.getIconForFolder();
    
    expect(directoryIcon.type).eq('svg');
    expect(directoryIcon.strings[0]).contains('directory');
  });

  describe('icons should be retrieved base on file extensions', () => {

    it('should retrieve a default icon if the file extension is unknown', () => {
      const unknownFileType = 'testfile.testextension';

      const fileIcon = sut.getIconForFile(unknownFileType);

      expect(fileIcon.type).eq('svg');
      expect(fileIcon.strings[0]).contains('file');
    });

    describe('retrieve based on known file types', () => {
      var knownfileExtensions = ['cs', 'html','java','js', 'scala','ts'];

      knownfileExtensions.forEach((fileExtension) => {
       it(`should retrieve an icon for file extension "${fileExtension}"`, () => {
         const knownFileExtension = `testfile.${fileExtension}`;
      
         const fileIcon = sut.getIconForFile(knownFileExtension);
      
         expect(fileIcon.type).eq('svg');
         expect(fileIcon.strings[0]).contains(fileExtension);
       });
      });
    });
  });
});