const revealCloseAttr = 'revealClose'
const revealCloseSelector = `.js-reveal-close`
const revealSelector = '.js-reveal'
import q$, { q$$, parents } from './selector'

class RevealClose {
    constructor($button) {
        this.$button = $button
        this.modalId = $button.dataset.revealCloseAttr

        this.onClick = this.onClick.bind(this)

        this.bindEvents()
    }

    get modal() {
        let $modal

        if (this.modalId) {
            $modal = q$(`#${this.modalId}`)
        } else {
            $modal = parents(revealSelector, this.$button)[0]
        }
        return $modal.data.modalInstance
    }

    bindEvents() {
        this.$button.addEventListener('click', this.onClick)
    }

    unbindEvents() {
        this.$button.removeEventListener('click', this.onClick)
    }

    onClick(event) {
        const { modal } = this

        if (modal) {
            event.preventDefault()

            modal.close()
        }
    }
}

/*
 * Extend foundation.reveal with the ability to close a modal by clicking on any of its child element
 * with data-reveal-close attribute.
 *
 * @example
 *
 * <div data-reveal id="helloModal">
 *   <button data-reveal-close>Continue</button>
 * </div>
 *
 * <div data-reveal id="helloModal"></div>
 * <button data-reveal-close="helloModal">Continue</button>
 */
export default function revealCloseFactory(selector = revealCloseSelector, options = {}) {
    const $buttons = q$$(selector, options.$context)

    return $buttons.map((element) => {
        const $button = element
        const instanceKey = `${revealCloseAttr}Instance`
        const cachedButton = 'data' in $button ? $button.data[instanceKey] : null

        if (cachedButton instanceof RevealClose) {
            return cachedButton
        }

        const button = new RevealClose($button)

        if ('data' in $button === false) {
            $button.data = {}
        }

        $button.data[instanceKey] = button

        return button
    })
}
