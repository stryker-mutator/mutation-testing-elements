const path = require('path');
const { File } = require('@stryker-mutator/api/core');
exports.strykerPlugins = [{
  factory: transpilerFactory,
  kind: 'Transpiler',
  name: 'tsconfig'
}];

function transpilerFactory(log) {
  return {
    async transpile(files) {
      return files.map(file => {
        if (path.extname(file.name) === '.json' && path.basename(file.name).indexOf('tsconfig') >= 0) {
          const newContent = file.textContent.replace(/"extends"\s*:\s*"(..\/[^"]*)"/, (_, str) => {
            const better = `../../${str}`;
            log.debug('Replacing in %s ("%s" -> "%s")', file.name, str, better);
            return `"extends": "${better}"`;
          }).replace(/"path":\s*"(..\/..\/[^"]*)"/, (_, str) => {
            const better = `../../${str}`;
            log.debug('Replacing in %s ("%s" -> "%s")', file.name, str, better);
            return `"path": "${better}"`;
          });
          return new File(file.name, newContent);
        } else {
          return file;
        }
      });
    }
  }
}
transpilerFactory.inject = ['logger'];