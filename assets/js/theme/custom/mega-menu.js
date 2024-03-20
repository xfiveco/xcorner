/**
 * Open mega menu on search button click
 */

import { constants } from './constants'

export default function megaMenu() {
    const MOBILE_WIDTH = constants.MOBILE_WIDTH
    const dropdown = document.querySelector('.js-dropdown')
    const searchButton = document.querySelector('.js-mega-menu-search')
    const searchInput = document.querySelector('.js-search-quick')
    const showMoreTriggers = document.querySelectorAll('.js-show-more-item')
    let hasAttachedEvent = false

    const openDesktopMenu = () => {
        dropdown.classList.toggle('is-open')
        searchInput.focus()
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

    showMoreTriggers.forEach((item) => {
        const button = item.querySelector('.js-show-more')
        button.addEventListener('click', () => {
            button.classList.toggle('is-open')

            const listItems = item
                .closest('.js-navigation-list-container')
                .querySelectorAll('.js-navigation-list-item:not(.js-navigation-list-item-shown)')

            listItems.forEach((listItem) => {
                listItem.classList.toggle('u-hidden@medium-down')
            })

            const buttonLabels = button.querySelectorAll('.js-show-label')
            if (listItems.length > 0) {
                buttonLabels.forEach((label) => {
                    label.classList.toggle('u-hidden')
                })
            }
        })
    })
}
