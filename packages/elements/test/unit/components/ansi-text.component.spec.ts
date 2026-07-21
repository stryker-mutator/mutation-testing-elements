import { AnsiTextComponent } from '../../../src/components/ansi-text/ansi-text.component.js';
import { CustomElementFixture } from '../helpers/CustomElementFixture.js';

const ESC = String.fromCharCode(27);

describe(AnsiTextComponent.name, () => {
  let sut: CustomElementFixture<AnsiTextComponent>;

  async function act(text: string): Promise<CustomElementFixture<AnsiTextComponent>> {
    sut = new CustomElementFixture('mte-ansi-text');
    sut.element.text = text;
    await sut.whenStable();
    return sut;
  }

  afterEach(() => {
    sut.dispose();
  });

  function innerSpan() {
    return sut.$<HTMLSpanElement>('span span');
  }

  it('should render plain text without ANSI codes as-is', async () => {
    await act('just plain text');
    expect(sut.$('span')).toHaveTextContent('just plain text');
  });

  it('should preserve the full text content of a string containing ANSI codes', async () => {
    await act(`plain ${ESC}[31mred${ESC}[0m end`);
    expect(sut.$('span')).toHaveTextContent('plain red end');
  });

  it('should render a foreground color as an rgb color style', async () => {
    await act(`${ESC}[31mred${ESC}[0m`);
    const span = innerSpan();
    expect(span).toHaveTextContent('red');
    expect(span).toHaveStyle({ color: 'rgb(187, 0, 0)' });
  });

  it('should render a background color as an rgb background-color style', async () => {
    await act(`${ESC}[41mred bg${ESC}[0m`);
    const span = innerSpan();
    expect(span).toHaveTextContent('red bg');
    expect(span).toHaveStyle({ backgroundColor: 'rgb(187, 0, 0)' });
  });

  it('should render a bold decoration as a tailwind class', async () => {
    await act(`${ESC}[1mbold${ESC}[0m`);
    expect(innerSpan()).toHaveClass('font-bold');
  });

  it('should render an italic decoration as a tailwind class', async () => {
    await act(`${ESC}[3mitalic${ESC}[0m`);
    expect(innerSpan()).toHaveClass('italic');
  });

  it('should render an underline decoration as a tailwind class', async () => {
    await act(`${ESC}[4munderline${ESC}[0m`);
    expect(innerSpan()).toHaveClass('underline');
  });

  it('should not add styling spans for unstyled text', async () => {
    await act('no styling here');
    // Only the wrapping span should exist, no nested styling spans
    expect(sut.$$('span')).lengthOf(1);
  });

  it('should render in monospace when the text contains ANSI styling', async () => {
    await act(`${ESC}[31mred${ESC}[0m`);
    expect(sut.$('span')).toHaveClass('font-mono');
  });

  it('should not render in monospace for plain single-chunk text', async () => {
    await act('just plain text');
    expect(sut.$('span')).not.toHaveClass('font-mono');
  });
});
