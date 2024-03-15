/**
 * Open mega menu on search button click
 */
export default function megaMenuSearch() {
    const MOBILE_WIDTH = 768
    const megaMenu = document.querySelector('.js-navigation-megamenu')
    const searchButton = document.querySelector('.js-mega-menu-search')

    const openDesktopMenu = () => {
        megaMenu.previousElementSibling.classList.toggle('is-open')
        megaMenu.classList.toggle('is-open')
    }

    const updateEventListeners = () => {
        const windowWidth = window.innerWidth

        if (searchButton) {
            searchButton.removeEventListener('click', openDesktopMenu)

            if (windowWidth >= MOBILE_WIDTH) {
                searchButton.addEventListener('click', openDesktopMenu)
            }
        }
    }

    updateEventListeners()

    window.addEventListener('resize', updateEventListeners)
}
