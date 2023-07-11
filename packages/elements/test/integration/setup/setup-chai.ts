/* eslint-disable @typescript-eslint/no-non-null-assertion */
import path from 'path';
import { platform } from 'os';
import { promises as fs, existsSync } from 'fs';
import * as chai from 'chai';
import type { Context } from 'mocha';
import compareImages from 'resemblejs/compareImages';
import type { ComparisonResult } from 'resemblejs';
import { expect } from 'chai';

let currentSnapshotFile: string;
const reportsDir = path.resolve('reports', 'diff');

chai.use(({ Assertion }) => {
  Assertion.addMethod('matchScreenshot', async function () {
    const snapshotFileExists = existsSync(currentSnapshotFile);
    const actualBase64Encoded: string = this._obj;
    if (process.env.UPDATE_ALL_SCREENSHOTS !== 'true' && (process.env.CI ?? snapshotFileExists)) {
      expect(snapshotFileExists, `Snapshot file does not exist! ${currentSnapshotFile}`).true;
      await assertSnapshot(actualBase64Encoded);
    } else {
      await updateSnapshot(actualBase64Encoded);
    }
  });
});

export const mochaHooks = {
  beforeEach(this: Context) {
    const { dir, name } = path.parse(this.currentTest!.file!);
    currentSnapshotFile = path.join(
      dir,
      name,
      `${this.currentTest!.fullTitle().toLowerCase().replace(/\s/g, '-').replace(/"/g, '')}.${platform()}.snap.png`
    );
  },
};

async function updateSnapshot(actualBase64Encoded: string) {
  await fs.mkdir(path.dirname(currentSnapshotFile), { recursive: true });
  await fs.writeFile(currentSnapshotFile, actualBase64Encoded, 'base64');
}

async function assertSnapshot(actualBase64Encoded: string) {
  const diff: ComparisonResult = await compareImages(`data:image/png;base64,${actualBase64Encoded}`, await fs.readFile(currentSnapshotFile), {});
  if (Number(diff.misMatchPercentage) >= 0.2) {
    const { name } = path.parse(currentSnapshotFile);
    await fs.mkdir(reportsDir, { recursive: true });
    const diffFileName = path.join(reportsDir, `${name}.diff.png`);
    await fs.writeFile(diffFileName, diff.getBuffer!(false));
    expect.fail(`Diff with snapshot is too large! See ${diffFileName}`);
  }
}
