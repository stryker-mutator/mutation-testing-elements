// @ts-check
const colors = require('tailwindcss/colors');

/**
 * @type {Record<string, [light: string, dark: string]>}
 */
const customTheme = {
  body: [colors.white, colors.slate['900']],
  muted: [colors.slate['600'], colors.slate['400']],
};

const light = Object.fromEntries(Object.entries(customTheme).map(([key, value]) => [key, value[0]]));
const dark = Object.fromEntries(Object.entries(customTheme).map(([key, value]) => [key, value[1]]));

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Custom selector for dark theme
  darkMode: ['class', ':host([theme="dark"])'],
  content: ['./src/**/*.ts'],
  theme: {
    extend: {
      spacing: {
        'offset': 'var(--top-offset, 0)'
      },
      colors: {
        body: 'var(--mut-body-bg)',
        light,
        dark,
      },
    },
  },
};
