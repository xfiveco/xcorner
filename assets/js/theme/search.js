import hooks from './common/hooks'
import CatalogPage from './catalog'
import FacetedSearch from './common/faceted-search'
import { announceInputErrorMessage } from './common/utils/form-utils'
import compareProducts from './global/compare-products'
import urlUtils from './common/utils/url-utils'
import collapsibleFactory from './common/collapsible'
import nod from './common/nod'
import q$, { q$$ } from './global/selector'
import trigger from './common/utils/trigger'
import categoryFilters from './custom/category-filters'
import searchFilterToggle from './custom/search-filter-toggle'

const leftArrowKey = 37
const rightArrowKey = 39

export default class Search extends CatalogPage {
    formatCategoryTreeForJSTree(node) {
        const nodeData = {
            text: node.data,
            id: node.metadata.id,
            state: {
                selected: node.selected,
            },
        }

        if (node.state) {
            nodeData.state.opened = node.state === 'open'
            nodeData.children = true
        }

        if (node.children) {
            nodeData.children = []
            node.children.forEach((childNode) => {
                nodeData.children.push(this.formatCategoryTreeForJSTree(childNode))
            })
        }

        return nodeData
    }

    showProducts(navigate = true) {
        this.$productListingContainer.classList.remove('u-hidden-visually')
        /* eslint-disable no-unused-expressions */
        this.$facetedSearchContainer?.classList.remove('u-hidden-visually')
        this.$contentResultsContainer.classList.add('u-hidden-visually')

        q$('.js-content-results-toggle')?.classList.remove('js-nav-bar-action-color-active')
        q$('.js-content-results-toggle')?.classList.add('js-nav-bar-action')

        q$('.js-product-results-toggle')?.classList.remove('js-nav-bar-action')
        q$('.js-product-results-toggle')?.classList.add('js-nav-bar-action-color-active')

        this.activateTab(q$('.js-product-results-toggle'))

        if (!navigate) {
            return
        }

        const searchData = q$('.js-search-results-product-count span').dataset
        const url =
            searchData.count > 0
                ? searchData.url
                : urlUtils.replaceParams(searchData.url, {
                      page: 1,
                  })

        urlUtils.goToUrl(url)
    }

    showContent(navigate = true) {
        this.$contentResultsContainer.classList.remove('u-hidden-visually')
        this.$productListingContainer.classList.add('u-hidden-visually')
        this.$facetedSearchContainer?.classList.add('u-hidden-visually')

        q$('.js-product-results-toggle')?.classList.remove('js-nav-bar-action-color-active')
        q$('.js-product-results-toggle')?.classList.add('js-nav-bar-action')

        q$('.js-content-results-toggle')?.classList.remove('js-nav-bar-action')
        q$('.js-content-results-toggle')?.classList.add('js-nav-bar-action-color-active')

        this.activateTab(q$('.js-content-results-toggle'))

        if (!navigate) {
            return
        }

        const searchData = q$('.js-search-results-content-count span').dataset
        const url =
            searchData.count > 0
                ? searchData.url
                : urlUtils.replaceParams(searchData.url, {
                      page: 1,
                  })

        urlUtils.goToUrl(url)
    }

    activateTab($tabToActivate) {
        const $tabsCollection = q$$('[role="tab"]', q$('.js-search-page-tabs'))

        $tabsCollection.forEach(($tab) => {
            if ($tab === $tabToActivate) {
                $tab.removeAttribute('tabindex')
                $tab.setAttribute('aria-selected', true)
                return
            }

            $tab.setAttribute('tabindex', '-1')
            $tab.setAttribute('aria-selected', false)
        })
    }

    onTabChangeWithArrows(event) {
        const eventKey = event.which
        const isLeftOrRightArrowKeydown = eventKey === leftArrowKey || eventKey === rightArrowKey
        if (!isLeftOrRightArrowKeydown) return

        const $tabsCollection = q$$('[role="tab"]', q$('.js-search-page-tabs'))

        const isActiveElementNotTab = $tabsCollection.indexOf(document.activeElement) !== -1
        if (isActiveElementNotTab) return

        const $activeTab = q$(`#${document.activeElement.id}`)
        const activeTabIdx = $tabsCollection.indexOf($activeTab)
        const lastTabIdx = $tabsCollection.length - 1

        let nextTabIdx
        switch (eventKey) {
            case leftArrowKey:
                nextTabIdx = activeTabIdx === 0 ? lastTabIdx : activeTabIdx - 1
                break
            case rightArrowKey:
                nextTabIdx = activeTabIdx === lastTabIdx ? 0 : activeTabIdx + 1
                break
            default:
                break
        }

        $tabsCollection[nextTabIdx].focus()
        trigger($tabsCollection[nextTabIdx], 'click')
    }

    onReady() {
        categoryFilters()
        compareProducts(this.context)
        this.arrangeFocusOnSortBy()
        searchFilterToggle()

        const $searchForm = q$('.js-advanced-search-form')
        // const $categoryTreeContainer = $searchForm.querySelector('.js-search-category-tree')
        const url = new URL(window.location.href)
        const treeData = []
        this.$productListingContainer = q$('.js-product-listing-container')
        this.$facetedSearchContainer = q$('.js-faceted-search-container')
        this.$contentResultsContainer = q$('.js-search-results-content')

        // Init faceted search
        if (q$('#faceted-search') !== null) {
            this.initFacetedSearch()
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this)
            hooks.on('sort-by-submitted', this.onSortBySubmit)
        }

        // Init collapsibles
        collapsibleFactory()

        q$('.js-product-results-toggle')?.addEventListener('click', (event) => {
            event.preventDefault()
            this.showProducts()
        })

        q$('.js-content-results-toggle')?.addEventListener('click', (event) => {
            event.preventDefault()
            this.showContent()
        })

        q$('.js-search-page-tabs')?.addEventListener('keyup', this.onTabChangeWithArrows)

        if (this.$productListingContainer.querySelectorAll('li.js-product').length === 0 || url.searchParams.get('section') === 'content') {
            this.showContent(false)
        } else {
            this.showProducts(false)
        }

        const validator = this.initValidation($searchForm).bindValidation($searchForm?.querySelector('#search_query_adv'))

        this.context.categoryTree.forEach((node) => {
            treeData.push(this.formatCategoryTreeForJSTree(node))
        })

        this.categoryTreeData = treeData
        // this.createCategoryTree($categoryTreeContainer)

        $searchForm?.addEventListener('submit', (event) => {
            // TODO: Add a jquer free jstree
            // const selectedCategoryIds = $categoryTreeContainer.jstree().get_selected()

            if (!validator.check()) {
                return event.preventDefault()
            }

            $searchForm.querySelector('input[name="category[]"]').remove()

            // for (const categoryId of selectedCategoryIds) {
            //     const $input = document.createElement('input')
            //     $input.type = 'hidden'
            //     $input.name = 'category[]'
            //     $input.value = categoryId

            //     $searchForm.append($input)
            // }
        })

        const $searchResultsMessage = document.createElement('p')
        $searchResultsMessage.classList.add('aria-description-hidden')
        $searchResultsMessage.tabIndex = '-1'
        $searchResultsMessage.setAttribute('role', 'status')
        $searchResultsMessage.setAttribute('aria-live', 'polite')

        q$('body').insertAdjacentElement('beforeend', $searchResultsMessage)

        requestAnimationFrame(() => {
            $searchResultsMessage.focus()
            // document.querySelector('html').scrollTop = 0

            window.scrollTo(0, 0)
        })
    }

    loadTreeNodes(node, cb) {
        fetch('/remote/v1/category-tree', {
            body: {
                selectedCategoryId: node.id,
                prefix: 'category',
            },
            headers: {
                'x-xsrf-token': window.BCData && window.BCData.csrf_token ? window.BCData.csrf_token : '',
            },
        })
            .then((data) => data.json())
            .then((data) => {
                const formattedResults = []

                data.forEach((dataNode) => {
                    formattedResults.push(this.formatCategoryTreeForJSTree(dataNode))
                })

                cb(formattedResults)
            })
    }

    // createCategoryTree($container) {
    //     const treeOptions = {
    //         core: {
    //             data: (node, cb) => {
    //                 // Root node
    //                 if (node.id === '#') {
    //                     cb(this.categoryTreeData)
    //                 } else {
    //                     // Lazy loaded children
    //                     this.loadTreeNodes(node, cb)
    //                 }
    //             },
    //             themes: {
    //                 icons: true,
    //             },
    //         },
    //         checkbox: {
    //             three_state: false,
    //         },
    //         plugins: ['checkbox'],
    //     }

    // $($container).jstree(treeOptions)  TODO: replace with a jQuery free jsTree
    // }

    initFacetedSearch() {
        // eslint-disable-next-line object-curly-newline
        const { onMinPriceError, onMaxPriceError, minPriceNotEntered, maxPriceNotEntered, onInvalidPrice } = this.context
        const $productListingContainer = q$('.js-product-listing-container')
        const $contentListingContainer = q$('.js-search-results-content')
        const $facetedSearchContainer = q$('.js-faceted-search-container')
        const $searchHeading = q$('.js-search-results-heading')
        const $searchCount = q$('.js-search-results-product-count')
        const $contentCount = q$('.js-search-results-content-count')
        const productsPerPage = this.context.searchProductsPerPage
        const requestOptions = {
            template: {
                productListing: 'search/product-listing',
                contentListing: 'search/content-listing',
                sidebar: 'search/sidebar',
                heading: 'search/heading',
                productCount: 'search/product-count',
                contentCount: 'search/content-count',
            },
            config: {
                product_results: {
                    limit: productsPerPage,
                },
            },
            showMore: 'search/show-more',
        }

        this.facetedSearch = new FacetedSearch(
            requestOptions,
            (content) => {
                $searchHeading.innerHTML = content.heading

                const url = new URL(window.location.href)
                if (url.searchParams.get('section') === 'content') {
                    $contentListingContainer.innerHTML = content.contentListing
                    $contentCount.innerHTML = content.contentCount
                    this.showContent(false)
                } else {
                    $productListingContainer.innerHTML = content.productListing
                    $facetedSearchContainer.innerHTML = content.sidebar
                    $searchCount.innerHTML = content.productCount
                    this.showProducts(false)
                }

                q$('html').scrollTop = 0
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

    initValidation($form) {
        this.$form = $form
        this.validator = nod({
            submit: $form,
            tap: announceInputErrorMessage,
        })

        return this
    }

    bindValidation($element) {
        if (this.validator) {
            this.validator.add({
                selector: $element,
                validate: 'presence',
                errorMessage: $element?.dataset?.errorMessage,
            })
        }

        return this
    }

    check() {
        if (this.validator) {
            this.validator.performCheck()
            return this.validator.areAll('valid')
        }

        return false
    }
}
