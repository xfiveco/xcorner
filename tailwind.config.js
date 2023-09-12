/* eslint-disable import/no-extraneous-dependencies */
const plugin = require('tailwindcss/plugin')
const bigCommerceConfig = require('./config.json')

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
            const bigCommerceUtilities = {
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
                '.js-inline-message': {
                    color: '#dc2626',
                },
            }

            Object.keys(bigCommerceConfig.settings)
                .filter((attribute) => attribute.startsWith('color-'))
                .forEach(
                    // eslint-disable-next-line no-return-assign
                    (attribute) =>
                        (bigCommerceUtilities[`.bc-${attribute}`] = {
                            'background-color': `var(--bc-${attribute}, black)`,
                        }),
                )

            addUtilities(bigCommerceUtilities)
        }),
    ],
}
