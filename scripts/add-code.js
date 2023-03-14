const fs =  require('node:fs');

const PATH = './assets/js/theme/custom';

const [, , fileName] = process.argv;

if (!fileName) {
    return 1
}

/**
 * We remove dashes and return a camelCased text
 *
 * @param {string} text
 * @returns {string}
 */
function camelCase( text ) {
    return text.split( '-' )
        .map((substring, index) => {
            if (index > 0) {
                return substring.charAt(0).toUpperCase() + substring.slice(1);
            }

            return substring
        })
        .join('')
}

const template = `
/**
 * ${ fileName.toUpperCase() }
 *
 */
export default function ${ fileName.indexOf('-') > -1 ? camelCase(fileName) : fileName }() {
    // TODO
}
`;

fs.appendFileSync(`${ PATH }/${ fileName }.js`, template);
