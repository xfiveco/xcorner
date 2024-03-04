import PageManager from './page-manager'
import addToCartWithModal from './custom/add-to-cart-modal'
import compareProducts from './global/compare-products'
import modalFactory from './global/modal'
import q$ from './global/selector'

export default class Home extends PageManager {
    constructor($scope, context) {
        super($scope, context)

        this.$overlay = q$('.js-cart-item-add .js-loading-overlay')
        this.previewModal = modalFactory('.js-preview-modal')

        addToCartWithModal('[data-button-type="add-cart"]', this.context, this.previewModal)
        compareProducts(this.context)
    }
}
