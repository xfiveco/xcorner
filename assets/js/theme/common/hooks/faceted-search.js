import BaseHooks from './base'

export default class extends BaseHooks {
    /**
     * @Constructor
     */
    constructor() {
        // call parent
        super()

        this.searchEvents()
    }

    searchEvents() {
        this.subscribe('click', '.js-faceted-search-facet', (event, target) => {
            this.emit('faceted-search-facet-clicked', event, target)
        })

        this.subscribe('submit', '.js-faceted-search-range', (event, target) => {
            this.emit('faceted-search-range-submitted', event, target)
        })
    }
}
