import './common/select-option-plugin'
import PageManager from './page-manager'
import mobileMenuToggle from './global/mobile-menu-toggle'
import menu from './global/menu'
import carousel from './common/carousel'
import svgInjector from './global/svg-injector'
import megaMenu from './custom/mega-menu'

export default class Global extends PageManager {
    onReady() {
        const { cartId, secureBaseUrl } = this.context
        /* eslint-disable prefer-const */
        let hasAttachedEvent = false

        // Cart Preview
        ;(() => import('./global/cart-preview').then((cartPreview) => cartPreview.default(secureBaseUrl, cartId)))()

        // Quick Search
        ;(() => import('./global/quick-search').then((quickSearch) => quickSearch.default()))()

        // Currency Selector
        ;(() => import('./global/currency-selector').then((currencySelector) => currencySelector.default(cartId)))()

        // Quick View
        ;(() => import('./global/quick-view').then((quickView) => quickView.default(this.context)))()

        carousel(this.context)
        menu()
        mobileMenuToggle()
        megaMenu(hasAttachedEvent)

        // Privacy Cookie Notification
        ;(() => import('./global/cookieNotification').then((privacyCookieNotification) => privacyCookieNotification.default()))()

        svgInjector()
    }
}
