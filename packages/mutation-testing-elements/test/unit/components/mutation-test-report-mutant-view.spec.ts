// describe('the drawer', () => {
//     beforeEach(async () => {
//       sut.element.report = createReport();
//       await sut.whenStable();
//     });

//     function selectDrawer() {
//       return sut.$('mutation-test-report-drawer-mutant') as MutationTestReportDrawerMutant;
//     }

//     it('should be rendered closed to begin with', () => {
//       expect(selectDrawer().mode).eq('closed');
//     });

//     it('should half open when a mutant is selected', async () => {
//       // Arrange
//       const mutant = new MutantModel(createMutantResult());
//       const event = createCustomEvent('mutant-selected', { selected: true, mutant });
//       window.location.hash = '#foobar.js';
//       await tick();
//       await sut.whenStable();

//       // Act
//       sut.$('mutation-test-report-file').dispatchEvent(event);
//       await sut.whenStable();
//       const drawer = selectDrawer();

//       // Assert
//       expect(drawer.mode).eq('half');
//       expect(drawer.mutant).eq(mutant);
//     });

//     it('should close when a mutant is deselected', async () => {
//       // Arrange
//       const mutant = new MutantModel(createMutantResult());
//       window.location.hash = '#foobar.js';
//       await tick();
//       await sut.whenStable();
//       sut.$('mutation-test-report-file').dispatchEvent(createCustomEvent('mutant-selected', { selected: true, mutant }));
//       const drawer = selectDrawer();
//       await sut.whenStable();

//       // Act
//       sut.$('mutation-test-report-file').dispatchEvent(createCustomEvent('mutant-selected', { selected: false, mutant }));
//       await sut.whenStable();

//       // Assert
//       expect(drawer.mode).eq('closed');
//       expect(drawer.mutant).eq(mutant);
//     });
//   });
