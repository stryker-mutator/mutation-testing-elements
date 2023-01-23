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
            safelist: [/^language-/, /^:host$/, /^mte-.*/],
          },
        }
      : {}),
  },
};
