import { debounce } from 'lodash'
import utils from '@bigcommerce/stencil-utils'
import hooks from '../common/hooks'
import StencilDropDown from './stencil-dropdown'
import q$, { q$$ } from './selector'
import isVisible from '../common/utils/is-visible'
import toggle from '../custom/toggle'

export default function doQuickSearch(context) {
    const TOP_STYLING = 'top: 49px;'
    const $quickSearchResults = q$$('.js-quick-search-results')
    const $quickSearchForms = q$$('.js-quick-search-form')
    const $quickSearchExpand = q$('.js-quick-search-expand')
    const $searchQuery = $quickSearchForms.map(($qsf) => q$('.js-search-quick', $qsf))
    const stencilDropDownExtendables = {
        hide: () => {
            $quickSearchExpand.setAttribute('aria-expanded', false)
            $searchQuery.forEach(($sq) => $sq.blur())
        },
        show: (event) => {
            $quickSearchExpand.setAttribute('aria-expanded', true)
            $searchQuery.forEach(($sq) => $sq.focus())
            event.stopPropagation()
        },
    }

    const stencilDropDown = new StencilDropDown(stencilDropDownExtendables)
    stencilDropDown.bind(q$('[data-search="quick-search"]'), q$('.js-quick-search'), TOP_STYLING)

    stencilDropDownExtendables.onBodyClick = (e, $container) => {
        // If the target element has this data tag or one of it's parents, do not close the search results
        // We have to specify `.modal-background` because of limitations around Foundation Reveal not allowing
        // any modification to the background element.
        if (e.target.closest('.js-modal-background') === null && e.target.closest('.js-prevent-quick-search-close') === null) {
            stencilDropDown.hide($container)
        }
    }

    // stagger searching for 1200ms after last input
    const debounceWaitTime = 1200
    const doSearch = debounce((searchQuery) => {
        $quickSearchResults
            .map(($el) => $el.nextElementSibling)
            // eslint-disable-next-line no-return-assign, no-param-reassign
            .forEach(($el) => ($el.textContent = 'Searching...'))

        utils.api.search.search(searchQuery, { template: 'search/quick-results' }, (err, response) => {
            if (err) {
                return false
            }

            $quickSearchResults.forEach(($qsr) => {
                /* eslint-disable no-param-reassign */
                $qsr.innerHTML = response
                if ($qsr.classList.contains('hidden')) {
                    $qsr.classList.remove('hidden')
                }
            })
            ;(() => import('./quick-view').then((quickView) => quickView.default(context)))()

            const $quickSearchResultsCurrent = $quickSearchResults.filter(($qsr) => isVisible($qsr))

            const $noResultsMessage = $quickSearchResultsCurrent.filter(($el) => $el.querySelector('.js-quick-search-message'))
            if ($noResultsMessage.length) {
                $noResultsMessage.forEach(($el) => {
                    $el.setAttribute('role', 'status')
                    $el.setAttribute('aria-live', 'polite')
                })
            } else {
                const $quickSearchAriaMessage = $quickSearchResultsCurrent.map(($el) => $el.nextElementSibling)
                $noResultsMessage.forEach(($nrm) => $nrm.classList.add('u-hidden-visually'))

                const predefinedText = $quickSearchAriaMessage[0]?.dataset.searchAriaMessagePredefinedText
                const itemsFoundCount = $quickSearchResultsCurrent[0]?.querySelectorAll('.js-product').length

                /* eslint-disable no-return-assign, no-param-reassign */
                $quickSearchAriaMessage.forEach(($el) => ($el.textContent = `${itemsFoundCount} ${predefinedText} ${searchQuery}`))

                setTimeout(() => {
                    $quickSearchAriaMessage.forEach(($el) => $el.classList.remove('u-hidden-visually'))
                }, 100)
            }
        })
    }, debounceWaitTime)

    hooks.on('search-quick', (event, currentTarget) => {
        const searchQuery = currentTarget.value

        // server will only perform search with at least 3 characters
        if (searchQuery.length < 3) {
            return
        }

        doSearch(searchQuery)
    })

    // Catch the submission of the quick-search forms
    $quickSearchForms.forEach(($qsf) => {
        $qsf.addEventListener('submit', (event) => {
            event.preventDefault()

            const $target = event.currentTarget
            const searchQuery = $target.querySelector('input')?.value
            const searchUrl = $target.dataset.url

            if (searchQuery.length === 0) {
                return
            }

            window.location.href = `${searchUrl}?search_query=${encodeURIComponent(searchQuery)}`
        })
    })

    $quickSearchResults.forEach(($qsr) => {
        $qsr.addEventListener('click', ({ target }) => {
            if (target.classList.contains('js-modal-close')) {
                $qsr.classList.add('hidden')
            }
        })
    })

    const $jsQuickSearchExpand = q$('.js-quick-search-expand')
    if ($jsQuickSearchExpand === null) {
        return
    }

    if ('hastoggle' in $jsQuickSearchExpand.dataset) {
        return
    }

    $jsQuickSearchExpand.dataset.hastoggle = true
    toggle('.js-quick-search-expand', {
        update: ['#menu > nav > div:first-child'],
    })
}
