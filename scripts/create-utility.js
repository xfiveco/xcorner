const fs =  require('node:fs');

const PATH = './assets/scss/utilities';

const [, , utilityName] = process.argv;

if (!utilityName) {
    return 1
}

const template = `
/* ==========================================================================
   #${ utilityName.toUpperCase() }
   ========================================================================== */

.u-${ utilityName } {
    /* TODO */
}
`;

fs.appendFileSync(`${ PATH }/_${ utilityName }.scss`, template);
fs.appendFileSync(`${ PATH }/_utilities.scss`, `\n@import "${ utilityName }";`);
