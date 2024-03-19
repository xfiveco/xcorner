/**
 * Open mega menu on search button click
 */
export default function megaMenu() {
    const MOBILE_WIDTH = 768
    const megaMenuElement = document.querySelector('.js-navigation-megamenu')
    const searchButton = document.querySelector('.js-mega-menu-search')
    const searchInputs = document.querySelectorAll('.js-search-quick')
    const showMore = document.querySelectorAll('.js-show-more')
    let hasAttachedEvent = false

    const openDesktopMenu = () => {
        megaMenuElement.previousElementSibling.classList.toggle('is-open')
        megaMenuElement.classList.toggle('is-open')
        searchInputs?.forEach((input) => {
            input.focus()
        })
    }

    const updateEventListeners = () => {
        const windowWidth = window.innerWidth
        if (searchButton) {
            if (windowWidth >= MOBILE_WIDTH && !hasAttachedEvent) {
                searchButton.addEventListener('click', openDesktopMenu)
                hasAttachedEvent = true
            }
        }
    }

    updateEventListeners()

    window.addEventListener('resize', updateEventListeners)

    showMore.forEach((button) => {
        button.addEventListener('click', () => {
            const buttonLabels = button.querySelectorAll('span')
            const svg = button.querySelector('svg')
            const liElements = []
            let prevElement = button.parentElement.previousElementSibling

            while (prevElement) {
                if (!prevElement.classList.contains('c-navigation-list__item--is-shown')) {
                    prevElement.classList.toggle('u-hidden@medium-down')
                }
                liElements.push(prevElement)
                prevElement = prevElement.previousElementSibling
            }

            if (liElements.length > 0) {
                buttonLabels.forEach((label) => {
                    label.classList.toggle('u-hidden')
                })

                svg.classList.toggle('rotate')
            }
        })
    })
}
