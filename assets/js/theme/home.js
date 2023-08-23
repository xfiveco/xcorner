import PageManager from './page-manager'
import addToCartWithModal from './custom/add-to-cart-modal'
import modalFactory from './global/modal'
import q$ from './global/selector'
import XsliderComponent from './custom/xslider'

export default class Home extends PageManager {
    constructor($scope, context) {
        super($scope, context)

        this.$overlay = q$('.js-cart-item-add .js-loading-overlay')
        this.previewModal = modalFactory('.js-preview-modal')

        addToCartWithModal('[data-button-type="add-cart"]', this.context, this.previewModal)

        if (!customElements.get('xslider-component')) {
            customElements.define('xslider-component', XsliderComponent)
        }
    }
}
