/**
 * Add hide search facets toggle in search page
 */
export default function searchFilterToggle() {
    const filterButton = document.querySelector('.js-search-hide-filters')
    const filterWrapper = document.querySelector('.js-search-facets')
    const filterButtonLabels = document.querySelectorAll('.js-hide-filters-label')
    if (filterButton) {
        filterButton.addEventListener('click', () => {
            filterWrapper.classList.toggle('is-open')
            filterButton.classList.toggle('is-open')
            filterButtonLabels.forEach((label) => {
                label.classList.toggle('is-open')
            })
        })
    }
}
