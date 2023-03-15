import hooks from './common/hooks'
import CatalogPage from './catalog'
import compareProducts from './global/compare-products'
import FacetedSearch from './common/faceted-search'
import { createTranslationDictionary } from './common/utils/translations-utils'
import q$, { q$$ } from './global/selector'
import trigger from './common/utils/trigger'

export default class Category extends CatalogPage {
    constructor(context) {
        super(context)
        this.validationDictionary = createTranslationDictionary(context)
    }

    setLiveRegionAttributes($element, roleType, ariaLiveStatus) {
        $element.setAttribute('role', roleType)
        $element.setAttribute('aria-live', ariaLiveStatus)
    }

    makeShopByPriceFilterAccessible() {
        if (q$('.js-shop-by-price') === null) return

        q$$('.js-nav-list-action').forEach(($navAction) => {
            if ($navAction.classList.contains('is-active')) {
                $navAction.focus()
            }

            $navAction.addEventListener('click', () => this.setLiveRegionAttributes(q$('.js-price-filter-message'), 'status', 'assertive'))
        })
    }

    onReady() {
        this.arrangeFocusOnSortBy()

        q$$('[data-button-type="add-cart"]').forEach(($addToCart) => {
            $addToCart.addEventListener('click', (e) => this.setLiveRegionAttributes(e.currentTarget.nextSibling, 'status', 'polite'))
        })

        this.makeShopByPriceFilterAccessible()

        compareProducts(this.context)

        if (q$('.js-facets-search-wrapper') !== null) {
            this.initFacetedSearch()
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this)
            hooks.on('sort-by-submitted', this.onSortBySubmit)
        }

        /* eslint-disable no-unused-expressions */
        q$('.js-action-reset')?.addEventListener('click', () => this.setLiveRegionsAttributes(q$('.js-price-reset-message'), 'status', 'polite'))

        this.ariaNotifyNoProducts()
    }

    ariaNotifyNoProducts() {
        const $noProductsMessage = q$('.js-no-products-notification')
        if ($noProductsMessage) {
            $noProductsMessage.focus()
        }
    }

    initFacetedSearch() {
        const {
            price_min_evaluation: onMinPriceError,
            price_max_evaluation: onMaxPriceError,
            price_min_not_entered: minPriceNotEntered,
            price_max_not_entered: maxPriceNotEntered,
            price_invalid_value: onInvalidPrice,
        } = this.validationDictionary
        const $productListingContainer = q$('.js-product-listing-container')
        const $facetedSearchContainer = q$('.js-faceted-search-container')
        const productsPerPage = this.context.categoryProductsPerPage
        const requestOptions = {
            config: {
                category: {
                    shop_by_price: true,
                    products: {
                        limit: productsPerPage,
                    },
                },
            },
            template: {
                productListing: 'category/product-listing',
                sidebar: 'category/sidebar',
            },
            showMore: 'category/show-more',
        }

        this.facetedSearch = new FacetedSearch(
            requestOptions,
            (content) => {
                $productListingContainer.innerHTML = content.productListing
                $facetedSearchContainer.innerHTML = content.sidebar

                trigger(q$('body'), 'compare-reset')

                q$('body').scrollTop = 0
            },
            {
                validationErrorMessages: {
                    onMinPriceError,
                    onMaxPriceError,
                    minPriceNotEntered,
                    maxPriceNotEntered,
                    onInvalidPrice,
                },
            },
        )
    }
}
