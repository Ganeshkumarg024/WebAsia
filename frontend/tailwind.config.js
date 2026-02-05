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
                    50: '#e6f4fb',
                    100: '#cce9f7',
                    200: '#99d3ef',
                    300: '#66bde7',
                    400: '#33a7df',
                    500: '#0A7FBF', // Main primary
                    600: '#086699',
                    700: '#064c73',
                    800: '#04334d',
                    900: '#021926',
                },
                secondary: {
                    50: '#fdeee8',
                    100: '#fbddd1',
                    200: '#f7bba3',
                    300: '#f39975',
                    400: '#ef7747',
                    500: '#E85A24', // Main secondary
                    600: '#ba481d',
                    700: '#8b3616',
                    800: '#5d240e',
                    900: '#2e1207',
                },
                accent: {
                    50: '#ebebfd',
                    100: '#d7d7fb',
                    200: '#afaff7',
                    300: '#8787f3',
                    400: '#5f5fef',
                    500: '#5558DD', // Main accent
                    600: '#4446b1',
                    700: '#333585',
                    800: '#222358',
                    900: '#11122c',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'fadeInUp': 'fadeInUp 0.6s ease-out',
                'slideInLeft': 'slideInLeft 0.6s ease-out',
                'slideInRight': 'slideInRight 0.6s ease-out',
                'scaleIn': 'scaleIn 0.5s ease-out',
                'blob': 'blob 7s infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideInLeft: {
                    '0%': { opacity: '0', transform: 'translateX(-50px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                slideInRight: {
                    '0%': { opacity: '0', transform: 'translateX(50px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.9)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                '3d': '0 20px 60px rgba(0, 0, 0, 0.3)',
            },
        },
    },
    plugins: [],
}
