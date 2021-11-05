module.exports = {
  plugins: [
    require('cssnano')({
      preset: 'default',
    }),
    require('@fullhuman/postcss-purgecss')({
      content: ['src/**/*.ts'],
      // Don't purge dynamically added classes
      safelist: [/^(bg|text|mutant)-(success|caution|danger|warning|secondary|default|info)(-light)?$/, /^language-/, /^:host$/],
    }),
  ],
};
