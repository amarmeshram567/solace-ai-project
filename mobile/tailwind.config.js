/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                background: '#FFF7BC',
                mint: '#91D5B5',
                coral: '#FFA99A',
                lavender: '#C9B3E6',
                skyBlue: '#C9D9F7',
                warmYellow: '#F9DC78',
                card: '#FFFEFA',
                coralWash: '#FFF0EC',
                lavenderWash: '#F2ECF8',
                warmYellowWash: '#FFF8DC',
                textPrimary: '#30332F',
                textSecondary: '#706F68',
                danger: '#B3261E',
            },
        },
    },
    plugins: [],
};