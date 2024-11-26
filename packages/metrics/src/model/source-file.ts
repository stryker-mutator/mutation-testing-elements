import type { OpenEndLocation } from 'mutation-testing-report-schema';

import { computeLineStarts } from '../helpers/index.js';

export function assertSourceDefined(source: string | undefined): asserts source {
  if (source === undefined) {
    throw new Error('sourceFile.source is undefined');
  }
}

export abstract class SourceFile {
  public abstract source: string | undefined;
  private lineMap?: number[];

  public getLineMap(): number[] {
    assertSourceDefined(this.source);
    return this.lineMap ?? (this.lineMap = computeLineStarts(this.source));
  }

  /**
   * Retrieves the source lines based on the `start.line` and `end.line` property.
   */
  public getLines(location: OpenEndLocation): string {
    assertSourceDefined(this.source);
    const lineMap = this.getLineMap();
    return this.source.substring(lineMap[location.start.line], lineMap[(location.end ?? location.start).line + 1]);
  }
}
