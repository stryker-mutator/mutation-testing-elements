module.exports = {
  plugins: [
    require('cssnano')({
      preset: 'default',
    }),
    require('@fullhuman/postcss-purgecss')({
      content: ['src/**/*.ts'],
      // Don't purge dynamically added classes
      safelist: [/^(bg|badge|popover|text)-(success|caution|danger|warning|secondary|default)(-light)?$/, /^language-/, /^:host$/],
    }),
  ],
};
