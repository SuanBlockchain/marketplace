const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // ...
    'node_modules/flowbite-react/lib/esm/**/*.js',
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
    'node_modules/flowbite/**/*.{js,jsx,ts,tsx}',
    './*/**/*.{js,ts,jsx,tsx,html,css}',
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    ripple: (theme) => ({
      colors: theme('colors'),
    }),
    extend: {
      height: {
        300: '300px',
      },
      fontSize: {
        xxs: '0.65rem',
      },
      colors: {
        'custom-fondo': '#ffffff',
        'custom-dark': '#333333',
        'custom-dark-hover': '#212121',
        'custom-hover': '#4aa3df',
        'custom-hover-invert': '#95e9fb',
            'custom-marca-boton': '#333333',
        'custom-marca-boton-variante': '#212121'
      },
      blur: {
        xs: '2px',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [
    // ...
    require('flowbite/plugin'),
    require('tailwindcss-animated'),
    require('tailwindcss-ripple')(),
  ],
};
