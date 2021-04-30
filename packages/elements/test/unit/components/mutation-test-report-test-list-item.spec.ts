import { expect } from 'chai';
import { MutantModel, TestModel } from 'mutation-testing-metrics';
import { MutationTestReportTestListItemComponent } from '../../../src/components/test-list-item/test-list-item.component';
import { CustomEventMap } from '../../../src/lib/custom-events';
import { createMutantResult, createTestDefinition } from '../../helpers/factory';
import { CustomElementFixture } from '../helpers/CustomElementFixture';

describe(MutationTestReportTestListItemComponent.name, () => {
  let sut: CustomElementFixture<MutationTestReportTestListItemComponent>;
  let test: TestModel;

  beforeEach(async () => {
    sut = new CustomElementFixture('mte-test-list-item');
    test = new TestModel(createTestDefinition({ name: 'foo should bar', location: { start: { line: 4, column: 5 } } }));
    // Set status to "Killing"
    test.addKilled(new MutantModel(createMutantResult()));
    sut.element.test = test;
    await sut.whenStable();
  });

  it('should show the test information', () => {
    expect(sut.$('button').innerText).eq('✅ foo should bar (4:5) [Killing]');
  });

  it('should toggle selected on click', async () => {
    const button = sut.$('button');
    button.click();
    await sut.whenStable();
    expect([...button.classList]).includes('active');
  });

  it('should dispatch "test-selected" when clicked', async () => {
    const actual = await sut.catchCustomEvent('test-selected', () => sut.$('button').click());
    const expectedDetail: CustomEventMap['test-selected'] = { selected: true, test };
    expect(actual!.detail).deep.eq(expectedDetail);
  });

  it('should dispatch "test-selected" false when clicked a second time', async () => {
    sut.element.active = true;
    await sut.whenStable();
    const actual = await sut.catchCustomEvent('test-selected', () => sut.$('button').click());
    const expectedDetail: CustomEventMap['test-selected'] = { selected: false, test };
    expect(actual!.detail).deep.eq(expectedDetail);
  });
});
