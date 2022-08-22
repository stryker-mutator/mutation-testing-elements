module.exports = {
  plugins: {
    tailwindcss: {},
    ...(process.env.NODE_ENV === 'production'
      ? {
          cssnano: {},

          // TODO: still needed for tailwind?
          '@fullhuman/postcss-purgecss': {
            content: ['src/**/*.ts'],
            // Don't purge dynamically added classes
            safelist: [/^(bg|text|mutant)-(success|caution|danger|warning|secondary|default|info)(-light)?$/, /^language-/, /^:host$/, /^mte-.*/],
          },
        }
      : {}),
  },
};
