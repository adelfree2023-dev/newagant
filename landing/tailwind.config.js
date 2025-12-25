/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                tajawal: ['Tajawal', 'sans-serif'],
            },
            colors: {
                primary: {
                    50: '#EFF6FF',
                    100: '#DBEAFE',
                    500: '#3B82F6',
                    600: '#2563EB',
                    700: '#1D4ED8',
                    800: '#1E40AF',
                }
            }
        },
    },
    plugins: [],
}
