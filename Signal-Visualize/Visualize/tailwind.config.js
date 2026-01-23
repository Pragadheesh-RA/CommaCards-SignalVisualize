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
                    500: '#5365ff', // Vibrant Indigo
                    600: '#3d47f5',
                    700: '#3236e1',
                    800: '#2a2db9',
                    900: '#262a94',
                    950: '#171856',
                },
                matte: {
                    100: '#ffffff',
                    200: '#f8fafc',
                    300: '#f1f5f9',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a', // Deep Matte
                    950: '#020617', // Void
                },
                luminous: {
                    teal: '#2dd4bf',
                    purple: '#c084fc',
                    amber: '#fbbf24',
                }
            },
            fontFamily: {
                sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'kinetic': '0 20px 40px -15px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0,0,0,0.02)',
                'kinetic-dark': '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)',
                'glow-primary': '0 0 20px -5px rgba(83, 101, 255, 0.4)',
                'glow-sm': '0 0 10px -2px rgba(83, 101, 255, 0.2)',
            },
            animation: {
                'spring-in': 'springIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                'slide-up-fade': 'slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'pulse-magnetic': 'pulseMagnetic 4s ease-in-out infinite',
                'aurora': 'aurora 20s linear infinite',
                'float-slow': 'float 8s ease-in-out infinite',
            },
            keyframes: {
                springIn: {
                    '0%': { transform: 'scale(0.9) translateY(10px)', opacity: '0' },
                    '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
                },
                slideUpFade: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                pulseMagnetic: {
                    '0%, 100%': { transform: 'scale(1)', filter: 'brightness(1)' },
                    '50%': { transform: 'scale(1.02)', filter: 'brightness(1.1)' },
                },
                aurora: {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
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
