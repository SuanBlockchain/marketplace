
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // ...
    'node_modules/flowbite-react/lib/esm/**/*.js',
    "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
    "node_modules/flowbite/**/*.{js,jsx,ts,tsx}",
    './*/**/*.{js,ts,jsx,tsx,html,css}'
  ],
  theme: {
    extend: {
      height: {
        '300': '300px',
      },
    },
  },
  plugins: [
    // ...
    require('flowbite/plugin'),
  ],
};
