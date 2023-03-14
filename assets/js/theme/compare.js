import PageManager from './page-manager'
import { showAlertModal } from './global/modal'
import compareProducts from './global/compare-products'
import { q$$ } from './global/selector'

export default class Compare extends PageManager {
    onReady() {
        compareProducts(this.context)

        const message = this.context.compareRemoveMessage

        q$$('.js-comparison-remove').forEach(($remove) => {
            $remove.addEventListener('click', (event) => {
                if (this.context.comparisons.length <= 2) {
                    showAlertModal(message)
                    event.preventDefault()
                }
            })
        })
    }
}
