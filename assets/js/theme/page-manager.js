export default class PageManager {
    constructor(context) {
        this.context = context
    }

    type() {
        return this.constructor.name
    }

    onReady() {}

    static load(context) {
        const page = new this(context)

        document.addEventListener('DOMContentLoaded', () => {
            page.onReady.bind(page)()
        })

        if (document.readyState === 'interactive' || document.readyState === 'complete') {
            page.onReady.bind(page)()
        }
    }
}
