// import { CustomElementFixture } from '../helpers/CustomElementFixture';
// import { FileComponent } from '../../../src/components/file/file.component';
// import { expect } from 'chai';
// import { FileResult, MutantStatus } from 'mutation-testing-report-schema/api';
// import { MutationTestReportMutantComponent } from '../../../src/components/mutant/mutant.component';
// import { FileStateFilterComponent, StateFilter } from '../../../src/components/state-filter/state-filter.component';
// import { createFileResult } from '../../helpers/factory';
// import { createCustomEvent } from '../../../src/lib/custom-events';
// import { FileUnderTestModel } from 'mutation-testing-metrics';

// describe(FileComponent.name, () => {
//   let sut: CustomElementFixture<FileComponent>;
//   let fileResult: FileResult;

//   beforeEach(async () => {
//     fileResult = createFileResult();
//     sut = new CustomElementFixture('mte-file', { autoConnect: false });
//     sut.element.model = new FileUnderTestModel(fileResult, 'foo.js');
//     sut.connect();
//     await sut.whenStable();
//   });

//   afterEach(() => {
//     sut.dispose();
//   });

//   it('should show the code', () => {
//     expect(sut.$('code').textContent).eq(fileResult.source);
//   });

//   it('should highlight the code', () => {
//     expect(sut.$('code .token')).ok;
//   });

//   describe('with `mte-mutant`', () => {
//     let mutantComponent: MutationTestReportMutantComponent;
//     let legendComponent: FileStateFilterComponent<MutantStatus>;

//     beforeEach(() => {
//       mutantComponent = sut.$('mte-mutant') as MutationTestReportMutantComponent;
//       legendComponent = sut.$('mte-state-filter') as FileStateFilterComponent<MutantStatus>;
//     });

//     it('should expand `mte-mutant` when the "expand-all" event is triggered', async () => {
//       legendComponent.dispatchEvent(createCustomEvent('expand-all', undefined));
//       await sut.whenStable();
//       expect(mutantComponent.expand).true;
//     });

//     it('should collapse `mte-mutant` when the "collapse-all" event is triggered', async () => {
//       mutantComponent.expand = true;
//       legendComponent.dispatchEvent(createCustomEvent('collapse-all', undefined));
//       await sut.whenStable();
//       expect(mutantComponent.expand).false;
//     });

//     it('should update hide a mutant if it is filtered', async () => {
//       // Arrange
//       const filters: StateFilter<MutantStatus>[] = [
//         {
//           enabled: false,
//           count: 1,
//           status: MutantStatus.Killed,
//           context: 'success',
//           label: '✅ Killed',
//         },
//       ];
//       mutantComponent.show = true;

//       // Act
//       legendComponent.dispatchEvent(createCustomEvent('filters-changed', filters));
//       await sut.whenStable();

//       // Assert
//       expect(mutantComponent.show).false;
//     });
//   });
// });

// it('should insert mte-mutant elements at the end of the line', () => {
//   const input: FileResult = {
//     language: 'javascript',
//     mutants: [
//       {
//         id: '1',
//         location: { end: { column: 13, line: 3 }, start: { column: 10, line: 3 } },
//         mutatorName: 'MethodReplacement',
//         replacement: 'foo',
//         status: MutantStatus.Killed,
//       },
//       {
//         id: '2',
//         location: { end: { column: 999 /*Doesn't exist*/, line: 4 }, start: { column: 15, line: 4 } },
//         mutatorName: 'SemicolonRemover',
//         replacement: '',
//         status: MutantStatus.Survived,
//       },
//     ],
//     source: `const foo = 'bar';

//     function add(a, b) {
//       return a + b;
//     }`
//       .replace(/ {6}/g, '')
//       .trim(), // strip the padding left
//   };
//   const actualCode = highlightedCodeTableWithMutants(input);
//   expect(actualCode).include('add <mte-mutant mutant-id="1">');
//   expect(actualCode).include('a + b;<mte-mutant mutant-id="2"></mte-mutant>');
// });
