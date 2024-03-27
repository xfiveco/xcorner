import hooks from './common/hooks'
import CatalogPage from './catalog'
import compareProducts from './global/compare-products'
import FacetedSearch from './common/faceted-search'
import { createTranslationDictionary } from './common/utils/translations-utils'
import q$ from './global/selector'

export default class Brand extends CatalogPage {
    constructor(context) {
        super(context)
        this.validationDictionary = createTranslationDictionary(context)
    }

    onReady() {
        compareProducts(this.context)

        if (q$('#faceted-search') !== null) {
            this.initFacetedSearch()
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this)
            hooks.on('sort-by-submitted', this.onSortBySubmit)
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
        const productsPerPage = this.context.brandProductsPerPage
        const requestOptions = {
            template: {
                productListing: 'brand/product-listing',
                sidebar: 'brand/sidebar',
            },
            config: {
                shop_by_brand: true,
                brand: {
                    products: {
                        limit: productsPerPage,
                    },
                },
            },
            showMore: 'brand/show-more',
        }

        this.facetedSearch = new FacetedSearch(
            requestOptions,
            (content) => {
                $productListingContainer.innerHTML = content.productListing
                $facetedSearchContainer.innerHTML = content.sidebar

                q$('html').scrollTop(0)
                q$('body').scrollTop(0)
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
