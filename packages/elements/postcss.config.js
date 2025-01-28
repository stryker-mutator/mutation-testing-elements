export default {
  plugins: {
    'tailwindcss/nesting': {},
    tailwindcss: {},
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {}, autoprefixer: {} } : {}),
  },
};
