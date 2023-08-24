/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./templates/**/*.html'],
    theme: {
        extend: {},
    },
    // eslint-disable-next-line import/no-extraneous-dependencies
    plugins: [require('@tailwindcss/forms')],
}
