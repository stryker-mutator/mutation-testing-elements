import { expect } from 'chai';
import { MutantModel, TestModel } from 'mutation-testing-metrics';
import { MutationTestReportTestComponent } from '../../../src/components/test/test.component';
import { CustomEventMap } from '../../../src/lib/custom-events';
import { createMutantResult, createTestDefinition } from '../../helpers/factory';
import { CustomElementFixture } from '../helpers/CustomElementFixture';

describe(MutationTestReportTestComponent.name, () => {
  let sut: CustomElementFixture<MutationTestReportTestComponent>;
  let test: TestModel;

  beforeEach(async () => {
    sut = new CustomElementFixture('mte-test');
    test = new TestModel(createTestDefinition({ name: 'foo should bar', location: { start: { line: 4, column: 5 } } }));
    // Set status to "Killing"
    test.addKilled(new MutantModel(createMutantResult()));
    sut.element.test = test;
    await sut.whenStable();
  });

  it('should render a badge with correct context', () => {
    expect([...sut.$('.badge').classList]).includes('badge-success');
  });

  it('should toggle selected on click', async () => {
    const badge = sut.$('.badge');
    badge.click();
    await sut.whenStable();
    expect([...badge.classList]).includes('badge-info');
  });

  it('should dispatch "test-selected" when clicked', async () => {
    const actual = await sut.catchCustomEvent('test-selected', () => sut.$('.badge').click());
    const expectedDetail: CustomEventMap['test-selected'] = { selected: true, test };
    expect(actual!.detail).deep.eq(expectedDetail);
  });

  it('should dispatch "test-selected" false when clicked a second time', async () => {
    sut.element.active = true;
    await sut.whenStable();
    const actual = await sut.catchCustomEvent('test-selected', () => sut.$('.badge').click());
    const expectedDetail: CustomEventMap['test-selected'] = { selected: false, test };
    expect(actual!.detail).deep.eq(expectedDetail);
  });
});
