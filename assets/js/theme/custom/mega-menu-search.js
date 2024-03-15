/**
 * Open mega menu on search button click
 */
export default function megaMenuSearch() {
    const MOBILE_WIDTH = 768
    const megaMenu = document.querySelector('.js-navigation-megamenu')
    const searchButton = document.querySelector('.js-mega-menu-search')
    const searchInputs = document.querySelectorAll('.js-search-quick')
    let hasAttachedEvent = false

    const openDesktopMenu = () => {
        megaMenu.previousElementSibling.classList.toggle('is-open')
        megaMenu.classList.toggle('is-open')
        searchInputs?.forEach((input) => {
            input.focus()
        })
    }

    const updateEventListeners = () => {
        const windowWidth = window.innerWidth
        if (searchButton) {
            if (hasAttachedEvent) {
                searchButton.removeEventListener('click', openDesktopMenu)
                hasAttachedEvent = false
            }

            if (windowWidth >= MOBILE_WIDTH && !hasAttachedEvent) {
                searchButton.addEventListener('click', openDesktopMenu)
                hasAttachedEvent = true
            }
        }
    }

    updateEventListeners()

    window.addEventListener('resize', updateEventListeners)
}
