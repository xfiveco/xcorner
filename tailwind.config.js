/* eslint-disable import/no-extraneous-dependencies */
const plugin = require('tailwindcss/plugin')

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./templates/**/*.html'],
    theme: {
        extend: {
            maxWidth: {
                desktop: 'var(--max-w-desktop, 70rem)',
            },
            gridTemplateColumns: {
                product: '48% 1fr',
            },
            screens: {
                xs: '460px',
            },
        },
    },
    // eslint-disable-next-line import/no-extraneous-dependencies
    plugins: [
        require('@tailwindcss/forms'),
        plugin(function ({ addUtilities }) {
            addUtilities({
                '.x-hidden': {
                    border: 0,
                    clip: 'rect(0 0 0 0)',
                    clipPath: 'insect(50%)',
                    height: '1px',
                    margin: '-1px',
                    overflow: 'hidden',
                    padding: 0,
                    position: 'absolute',
                    'white-space': 'nowrap',
                    width: '1px',
                },
            })
        }),
    ],
}
