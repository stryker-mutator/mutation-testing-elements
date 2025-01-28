import tailwindForms from '@tailwindcss/forms';
import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors.js';

/**
 * hexcodes need to be converted to single r g b values
 * @see https://tailwindcss.com/docs/customizing-colors#using-css-variables
 */
function hexToRgb(hexCode: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexCode);
  if (!result) throw new Error(`Invalid hex color: ${hexCode}`);

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `${r} ${g} ${b}`;
}

function toVariable(variableName: string, hexCode: string) {
  const fallBackColor = hexToRgb(hexCode);

  return `rgb(var(${variableName}, ${fallBackColor}) / <alpha-value>)`;
}

const colorRange = ['DEFAULT', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const;

/**
 * Generate a range of color variables in tailwind format
 */
const generateRange = (color: string, defaultColors: Record<keyof (typeof colors)['gray'], string> & { DEFAULT?: string }) =>
  Object.fromEntries(
    colorRange.map((range) => {
      const variableName = `--mut-${color}${range === 'DEFAULT' ? '' : `-${range}`}`;
      const variable = toVariable(variableName, defaultColors[range] ?? defaultColors['500']);

      return [range, variable];
    }),
  );

export default {
  content: ['./src/**/*.ts'],
  plugins: [tailwindForms],
  theme: {
    container: {
      center: true,
    },
    extend: {
      screens: {
        '3xl': '2000px',
      },
      spacing: {
        offset: 'var(--top-offset, 0)',
        'drawer-half-open': 'var(--mte-drawer-height-half-open, 0)',
      },
      colors: {
        white: toVariable('--mut-white', '#ffffff'),
        // ALL colors here _must_ also be defined in `src/components/app/theme.scss` for light _and_ dark mode!
        gray: generateRange('gray', colors.zinc),
        primary: {
          ...generateRange('primary', colors.sky),
          // color for 'on' background
          on: toVariable('--mut-primary-on', colors.sky['700']),
        },
      },
      transitionProperty: {
        'max-width': 'max-width',
        height: 'height',
        width: 'width',
        'stroke-opacity': 'stroke-opacity',
      },
    },
  },
} satisfies Config;
