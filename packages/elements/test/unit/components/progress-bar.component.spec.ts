import { MetricsResult } from 'mutation-testing-metrics';
import { ProgressBar } from '../../../src/components/progress-bar/progress-bar.component';
import { createTestMetricsResult, createMetrics } from '../../helpers/factory';
import { CustomElementFixture } from '../helpers/CustomElementFixture';
import { expect } from 'chai';

describe(ProgressBar.name, () => {
  let sut: CustomElementFixture<ProgressBar>;

  beforeEach(() => {
    sut = new CustomElementFixture('mte-progress-bar', { autoConnect: true });
  });

  afterEach(() => {
    sut.dispose();
  });

  it('should not be visible when visible is set to "false"', async () => {
    sut.element.visible = false;

    await sut.whenStable();

    expect(sut.$('div')).to.be.null;
  });

  it('should be visible when visible is set "true"', async () => {
    sut.element.visible = true;
    sut.element.rootModel = createRootModel();

    await sut.whenStable();

    expect(sut.$('div')).to.not.be.null;
  });

  it('should be empty when testing metrics are empty', async () => {
    sut.element.visible = true;
    sut.element.rootModel = createRootModel();
    sut.element.render();

    await sut.whenStable();

    const parts = sut.$$('.parts div');
    expect(parts.length).to.eq(3);
    expect(parts[0].style.width).to.eq('0%');
    expect(parts[0].classList.contains('bg-green-600')).to.be.true;
    expect(parts[1].style.width).to.eq('0%');
    expect(parts[1].classList.contains('bg-red-600')).to.be.true;
    expect(parts[2].style.width).to.eq('0%');
    expect(parts[2].classList.contains('bg-yellow-600')).to.be.true;
  });

  it('should be filled completely green when every mutants has been killed', async () => {
    const model = createRootModel();
    model.systemUnderTestMetrics.metrics.killed = 1;
    model.systemUnderTestMetrics.metrics.totalMutants = 1;
    sut.element.rootModel = model;
    sut.element.visible = true;

    await sut.whenStable();

    const parts = sut.$$('.parts div');
    expect(parts[0].style.width).to.eq('100%');
    expect(parts[1].style.width).to.eq('0%');
    expect(parts[2].style.width).to.eq('0%');
  });

  it('should be filled completely red when every mutants has survived', async () => {
    const model = createRootModel();
    model.systemUnderTestMetrics.metrics.survived = 1;
    model.systemUnderTestMetrics.metrics.totalMutants = 1;
    sut.element.rootModel = model;
    sut.element.visible = true;

    await sut.whenStable();

    const parts = sut.$$('.parts div');
    expect(parts[0].style.width).to.eq('0%');
    expect(parts[1].style.width).to.eq('100%');
    expect(parts[2].style.width).to.eq('0%');
  });

  it('should be filled completely yellow when every mutants has any other state', async () => {
    const model = createRootModel();
    model.systemUnderTestMetrics.metrics.ignored = 1;
    model.systemUnderTestMetrics.metrics.compileErrors = 1;
    model.systemUnderTestMetrics.metrics.timeout = 1;
    model.systemUnderTestMetrics.metrics.runtimeErrors = 1;
    model.systemUnderTestMetrics.metrics.noCoverage = 1;
    model.systemUnderTestMetrics.metrics.totalMutants = 5;
    sut.element.rootModel = model;
    sut.element.visible = true;

    await sut.whenStable();

    const parts = sut.$$('.parts div');
    expect(parts[0].style.width).to.eq('0%');
    expect(parts[1].style.width).to.eq('0%');
    expect(parts[2].style.width).to.eq('100%');
  });

  it('should fill all sections equally', async () => {
    const model = createRootModel();
    model.systemUnderTestMetrics.metrics.ignored = 1;
    model.systemUnderTestMetrics.metrics.killed = 1;
    model.systemUnderTestMetrics.metrics.survived = 1;
    model.systemUnderTestMetrics.metrics.totalMutants = 3;
    sut.element.rootModel = model;
    sut.element.visible = true;

    await sut.whenStable();

    const parts = sut.$$('.parts div');
    expect(parts[0].style.width).to.eq('33.3333%');
    expect(parts[1].style.width).to.eq('33.3333%');
    expect(parts[2].style.width).to.eq('33.3333%');
  });
});

function createRootModel() {
  return {
    systemUnderTestMetrics: new MetricsResult('wrappit', [], createMetrics()),
    testMetrics: createTestMetricsResult(),
  };
}
