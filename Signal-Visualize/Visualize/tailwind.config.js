/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f4ff',
                    100: '#e1e9ff',
                    200: '#c7d6ff',
                    300: '#a3b7ff',
                    400: '#7a8fff',
                    500: '#5365ff',
                    600: '#3d47f5',
                    700: '#3236e1',
                    800: '#2a2db9',
                    900: '#262a94',
                    950: '#171856',
                },
                surface: {
                    light: '#ffffff',
                    dark: '#0f172a',
                    "dark-elevated": '#1e293b'
                },
                glass: {
                    50: 'rgba(255, 255, 255, 0.05)',
                    100: 'rgba(255, 255, 255, 0.1)',
                    200: 'rgba(255, 255, 255, 0.2)',
                    800: 'rgba(15, 23, 42, 0.6)',
                    900: 'rgba(15, 23, 42, 0.8)',
                }
            },
            fontFamily: {
                sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
                'premium-dark': '0 20px 40px -20px rgba(0, 0, 0, 0.5)',
                'glow': '0 0 20px -5px rgba(83, 101, 255, 0.3)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                'pulse-soft': 'pulseSoft 3s infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.8' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
}
