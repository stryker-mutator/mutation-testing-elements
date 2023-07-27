import { ResultStatusBar } from '../../../src/components/result-status-bar/result-status-bar';
import { CustomElementFixture } from '../helpers/CustomElementFixture';
import { expect } from 'chai';

describe(ResultStatusBar.name, () => {
  let sut: CustomElementFixture<ResultStatusBar>;

  beforeEach(() => {
    sut = new CustomElementFixture('mte-result-status-bar', { autoConnect: true });
  });

  afterEach(() => {
    sut.dispose();
  });

  it('should be empty when no attributes are set', async () => {
    sut.element.render();

    await sut.whenStable();

    const parts = sut.$$('.parts div');
    expect(parts.length).to.eq(4);
    expect(parts[0].style.width).to.eq('0%');
    expect(parts[0].classList.contains('bg-green-600')).to.be.true;
    expect(parts[1].style.width).to.eq('0%');
    expect(parts[1].classList.contains('bg-red-600')).to.be.true;
    expect(parts[2].style.width).to.eq('0%');
    expect(parts[2].classList.contains('bg-yellow-600')).to.be.true;
    expect(parts[3].style.width).to.eq('0%');
    expect(parts[3].classList.contains('bg-gray-200')).to.be.true;
  });

  it('should be filled completely green when every mutants has been killed', async () => {
    sut.element.detected = 1;
    sut.element.total = 1;

    await sut.whenStable();

    const parts = sut.$$('.parts div');
    expect(parts[0].style.width).to.eq('100%');
    expect(parts[1].style.width).to.eq('0%');
    expect(parts[2].style.width).to.eq('0%');
    expect(parts[3].style.width).to.eq('0%');
  });

  it('should be filled completely red when every mutants has survived', async () => {
    sut.element.undetected = 1;
    sut.element.total = 1;

    await sut.whenStable();

    const parts = sut.$$('.parts div');
    expect(parts[0].style.width).to.eq('0%');
    expect(parts[1].style.width).to.eq('100%');
    expect(parts[2].style.width).to.eq('0%');
    expect(parts[3].style.width).to.eq('0%');
  });

  it('should be filled completely yellow when every mutants has any other state', async () => {
    sut.element.ignored = 1;
    sut.element.invalid = 1;
    sut.element.total = 2;

    await sut.whenStable();

    const parts = sut.$$('.parts div');
    expect(parts[0].style.width).to.eq('0%');
    expect(parts[1].style.width).to.eq('0%');
    expect(parts[2].style.width).to.eq('100%');
    expect(parts[3].style.width).to.eq('0%');
  });

  it('should be filled completely grey when every mutant has a pending state', async () => {
    sut.element.pending = 1;
    sut.element.total = 1;

    await sut.whenStable();

    const parts = sut.$$('.parts div');
    expect(parts[0].style.width).to.eq('0%');
    expect(parts[1].style.width).to.eq('0%');
    expect(parts[2].style.width).to.eq('0%');
    expect(parts[3].style.width).to.eq('100%');
  });

  it('should fill all sections equally', async () => {
    sut.element.detected = 1;
    sut.element.undetected = 1;
    sut.element.ignored = 1;
    sut.element.pending = 1;
    sut.element.total = 4;

    await sut.whenStable();

    const parts = sut.$$('.parts div');
    expect(parts[0].style.width).to.eq('25%');
    expect(parts[1].style.width).to.eq('25%');
    expect(parts[2].style.width).to.eq('25%');
    expect(parts[3].style.width).to.eq('25%');
  });
});
