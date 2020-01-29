module.exports = {
  plugins: [
    require('postcss-preset-env')({}),
    require('cssnano')({
      preset: 'default',
    }),
    require('@fullhuman/postcss-purgecss')({
      content: ['src/**/*.ts'],
      // Don't purge dynamically added classes
      whitelistPatterns: [/^(bg|badge|popover|text)-(success|caution|danger|warning|secondary|default)(-light)?$/, /^lang-/, /^hljs/, /^:host$/]
    })
  ]
}
