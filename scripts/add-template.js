const fs =  require('node:fs');

const PATH = './templates/components/custom';

const [, , templateName] = process.argv;

if (!templateName) {
    return 1
}

const template = `
{{!-- 
==========================================================================
 ${ templateName.toUpperCase() }
========================================================================== 
--}}

<div>
    <!-- TODO -->
</div>
`;

fs.appendFileSync(`${ PATH }/${ templateName }.html`, template);
