/**
 * Add toggle functionality to category filters
 *
 */
export default function categoryFilters() {
    const filters = document.querySelectorAll('.js-accordion-navigation')
    if (filters) {
        filters.forEach((filter) => {
            filter.addEventListener('click', () => {
                const facetId = filter.getAttribute('data-collapsible')
                const facetElement = document.querySelector(facetId)

                if (filter.classList.contains('is-open')) {
                    filter.classList.remove('is-open')
                    filter.setAttribute('aria-expanded', 'false')
                    facetElement.classList.remove('is-open')
                    facetElement.setAttribute('aria-hidden', 'true')
                } else {
                    filter.classList.add('is-open')
                    filter.setAttribute('aria-expanded', 'true')
                    facetElement.classList.add('is-open')
                    facetElement.setAttribute('aria-hidden', 'false')
                }
            })
        })
    }
}
