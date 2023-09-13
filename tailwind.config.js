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
        plugin(function ({ addUtilities, addComponents }) {
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
                .forEach((attribute) => {
                    bigCommerceUtilities[`.bc-bg-${attribute}`] = {
                        'background-color': `var(--bc-${attribute}, black)`,
                    }

                    bigCommerceUtilities[`.bc-text-${attribute}`] = {
                        color: `var(--bc-${attribute}, black)`,
                    }
                })

            addUtilities(bigCommerceUtilities)

            addComponents({
                '.c-button--primary': {
                    'background-color': 'var(--bc-color-primary, black)',
                    color: 'var(--bc-button-text-color, white)',
                    'padding-inline': `calc(var(--bc-button-padding-inline, 0) * 1rem)`,
                    'padding-block': `calc(var(--bc-button-padding-block, 0) * 1rem)`,
                    'border-radius': `calc(var(--bc-button-border-radius, 0) * 1rem)`,
                    border: `var(--bc-button-border-style) calc(var(--bc-button-border-width) * 1px) var(--bc-button-border-color)`,
                    'text-align': 'var(--bc-button-text-align)',
                    'text-decoration': 'none',
                    'text-transform': 'var(--bc-button-text-uppercase)',
                    transition: 'all cubic-bezier(.6,.07,.77,.53) 0.3s',
                    '&:hover': {
                        'background-color': 'var(--bc-button-hover-background-color, black)',
                        color: 'var(--bc-button-hover-text-color, white)',
                        transition: 'all bezier(.04,.75,.55,.82) 0.2s',
                    },
                    '&[disabled]': {
                        'background-color': 'lightgray',
                        color: 'white',
                        'pointer-events': 'none',
                    },
                },
                '.c-button--secondary': {
                    'background-color': 'var(--bc-color-secondary, black)',
                    color: 'var(--bc-button-secondary-text-color, white)',
                    'padding-inline': `calc(var(--bc-button-padding-inline, 0) * 1rem)`,
                    'padding-block': `calc(var(--bc-button-padding-block, 0) * 1rem)`,
                    'border-radius': `calc(var(--bc-button-border-radius, 0) * 1rem)`,
                    border: `var(--bc-button-border-style) calc(var(--bc-button-border-width) * 1px) var(--bc-button-border-color)`,
                    'text-align': 'var(--bc-button-text-align)',
                    'text-decoration': 'none',
                    'text-transform': 'var(--bc-button-text-uppercase)',
                    transition: 'all cubic-bezier(.6,.07,.77,.53) 0.3s',
                    '&:hover': {
                        'background-color': 'var(--bc-button-secondary-hover-background-color, black)',
                        color: 'var(--bc-button-secondary-hover-text-color, white)',
                        transition: 'all bezier(.04,.75,.55,.82) 0.2s',
                    },
                    '&[disabled]': {
                        'background-color': 'lightgray',
                        color: 'white',
                        'pointer-events': 'none',
                    },
                },
            })
        }),
    ],
}
