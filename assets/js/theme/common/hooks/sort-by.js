import BaseHooks from './base'

export default class extends BaseHooks {
    /**
     * @Constructor
     */
    constructor() {
        // call parent
        super()

        this.sortByEvents()
    }

    sortByEvents() {
        this.subscribe('submit', '.js-sort-by', (event, target) => {
            this.emit('sort-by-submitted', event, target)
        })

        this.subscribe('change', '.js-sort-by select', (event, target) => {
            this.emit('sort-by-select-changed', event, target)

            if (!event.defaultPrevented) {
                this.emit('sort-by-submitted', event, target)
            }
        })
    }
}
