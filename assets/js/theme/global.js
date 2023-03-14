import './common/select-option-plugin'
import PageManager from './page-manager'
import quickSearch from './global/quick-search'
import currencySelector from './global/currency-selector'
import mobileMenuToggle from './global/mobile-menu-toggle'
import menu from './global/menu'
import quickView from './global/quick-view'
import cartPreview from './global/cart-preview'
import privacyCookieNotification from './global/cookieNotification'
// import carousel from './common/carousel'
import svgInjector from './global/svg-injector'

export default class Global extends PageManager {
    onReady() {
        const { cartId, secureBaseUrl } = this.context
        cartPreview(secureBaseUrl, cartId)
        quickSearch()
        currencySelector(cartId)
        quickView(this.context)
        // carousel(this.context) TODO: Update Carousel implementation
        menu()
        mobileMenuToggle()
        privacyCookieNotification()
        svgInjector()
    }
}
