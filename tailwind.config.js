/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#6366f1',
                    dark: '#4f46e5',
                    light: '#818cf8',
                },
                dark: {
                    DEFAULT: '#0d0d14',
                    secondary: '#1a1a2e',
                    tertiary: '#1f1f35',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['Orbitron', 'monospace'],
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}
