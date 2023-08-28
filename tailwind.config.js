/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./templates/**/*.html'],
    theme: {
        extend: {
            maxWidth: {
                desktop: 'var(--max-w-desktop, 70rem)',
            },
        },
    },
    // eslint-disable-next-line import/no-extraneous-dependencies
    plugins: [require('@tailwindcss/forms')],
}
