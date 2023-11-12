export default {
  plugins: {
    tailwindcss: {},
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {}, autoprefixer: {} } : {}),
  },
};
