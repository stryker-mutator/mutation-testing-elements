const path = require('path');
const { File } = require('@stryker-mutator/api/core');
exports.strykerPlugins = [
  {
    factory: transpilerFactory,
    kind: 'Transpiler',
    name: 'tsconfig',
  },
];

/**
 *
 * @param {import('@stryker-mutator/api/logging').Logger)} log
 * @returns {import('@stryker-mutator/api/transpile').Transpiler}
 */
function transpilerFactory(log) {
  return {
    /**
     *
     * @return {Promise<import('@stryker-mutator/api/core').File[]>}
     */
    transpile(files) {
      return Promise.resolve(
        files.map((file) => {
          if (path.extname(file.name) === '.json' && path.basename(file.name).includes('tsconfig')) {
            const newContent = file.textContent
              .replace(/"extends"\s*:\s*"(..\/[^"]*)"/, (_, str) => {
                const better = `../../${str}`;
                log.debug('Replacing in %s ("%s" -> "%s")', file.name, str, better);
                return `"extends": "${better}"`;
              })
              .replace(/"path":\s*"(..\/..\/[^"]*)"/, (_, str) => {
                const better = `../../${str}`;
                log.debug('Replacing in %s ("%s" -> "%s")', file.name, str, better);
                return `"path": "${better}"`;
              });
            return new File(file.name, newContent);
          } else {
            return file;
          }
        })
      );
    },
  };
}
transpilerFactory.inject = ['logger'];
