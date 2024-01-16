/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
// The implementation of this file is grabbed and modified from TypeScript source code

const enum CharacterCodes {
  maxAsciiCharacter = 0x7f,
  lineFeed = 0x0a, // \n
  carriageReturn = 0x0d, // \r
  lineSeparator = 0x2028,
  paragraphSeparator = 0x2029,
}

function isLineBreak(ch: number): boolean {
  // ES5 7.3:
  // The ECMAScript line terminator characters are listed in Table 3.
  //     Table 3: Line Terminator Characters
  //     Code Unit Value     Name                    Formal Name
  //     \u000A              Line Feed               <LF>
  //     \u000D              Carriage Return         <CR>
  //     \u2028              Line separator          <LS>
  //     \u2029              Paragraph separator     <PS>
  // Only the characters in Table 3 are treated as line terminators. Other new line or line
  // breaking characters are treated as white space but not as line terminators.

  return (
    ch === CharacterCodes.lineFeed ||
    ch === CharacterCodes.carriageReturn ||
    ch === CharacterCodes.lineSeparator ||
    ch === CharacterCodes.paragraphSeparator
  );
}

export function computeLineStarts(text: string): number[] {
  const result: number[] = [];
  let pos = 0;
  let lineStart = 0;
  function progressLineStart(pos: number) {
    result.push(lineStart);
    lineStart = pos;
  }
  // Mutation testing elements works with 1-based lines
  progressLineStart(0);
  while (pos < text.length) {
    const ch = text.charCodeAt(pos);
    pos++;
    switch (ch) {
      case CharacterCodes.carriageReturn:
        if (text.charCodeAt(pos) === CharacterCodes.lineFeed) {
          pos++;
        }
        progressLineStart(pos);
        break;
      case CharacterCodes.lineFeed:
        progressLineStart(pos);
        break;
      default:
        if (ch > CharacterCodes.maxAsciiCharacter && isLineBreak(ch)) {
          progressLineStart(pos);
        }
        break;
    }
  }
  result.push(lineStart);
  return result;
}
