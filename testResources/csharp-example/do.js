const path = require('path');
const report = require('./mutation-report-old');

const newReport = {
  schemaVersion: '1',
  thresholds: {
    low: 60,
    high: 80
  },
  files: toFiles(report)
}
require('fs').writeFileSync('mutation-report.json', JSON.stringify(newReport, null, 2), 'utf8');

function toFiles(report, name = '') {
  if (report.childResults) {
    return { ...report.childResults.map(child => toFiles(child, path.join(name, report.name))).reduce((files, childFiles) => ({ ...files, ...childFiles }), {}) };
  } else {
    report.mutants.forEach(mutant => {
      mutant.location.start.column++;
      mutant.location.end.column++;
    });
    return {
      [path.resolve(name, report.name)]: {
        source: report.source,
        language: report.language,
        mutants: report.mutants
      }
    }
  }
}
