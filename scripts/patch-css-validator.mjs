// Removes error on Windows but, since we're not using SASS, we can remove its check
import { readFileSync, writeFileSync } from 'node:fs'

const VALIDATOR_PATH = 'node_modules/@bigcommerce/stencil-cli/lib/ScssValidator.js';

try {
    writeFileSync(
        VALIDATOR_PATH,
        readFileSync(VALIDATOR_PATH, { encoding: 'utf-8' }).replace('const cssFiles = await this.getCssFiles();', 'const cssFiles = [];'),
    )
} catch (error) {
    console.log('error ', error)
}
