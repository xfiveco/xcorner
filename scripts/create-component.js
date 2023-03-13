const fs =  require('node:fs');

const PATH = './assets/scss/components/';

const [, , componentName] = process.argv;

if (!componentName) {
    return 1
}

const template = `
/* ==========================================================================
   #${ componentName.toUpperCase() }
   ========================================================================== */

.c-${ componentName } {
    /* TODO */
}
`;

fs.appendFileSync(`${ PATH }/_${ componentName }.scss`, template);
fs.appendFileSync(`${ PATH }/_components.scss`, `\n@import "${ componentName }";`);
