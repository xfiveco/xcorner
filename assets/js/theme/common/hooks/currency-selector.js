import BaseHooks from './base';

export default class extends BaseHooks {
    /**
     * @Constructor
     */
    constructor() {
        // call parent
        super();

        this.currencySelector();
    }

    currencySelector() {
        this.subscribe('input', '.js-currency-selector-toggle', (event) => {
            this.emit('currency-selector-toggle', event);
        });
    }
}
