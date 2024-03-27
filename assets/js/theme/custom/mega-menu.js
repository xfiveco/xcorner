/**
 * Open mega menu on search button click
 */

import { constants } from './constants'

let isShowMoreEventAttached = false

export default function megaMenu(hasAttachedEvent) {
    let hasEvent = hasAttachedEvent
    const { MOBILE_WIDTH } = constants
    const dropdown = document.querySelector('.js-dropdown')
    const searchButton = document.querySelector('.js-mega-menu-search')
    const searchInput = document.querySelector('.js-search-quick')
    const showMoreTriggers = document.querySelectorAll('.js-show-more-item')

    const openDesktopMenu = () => {
        dropdown.classList.toggle('is-open')
        searchInput.focus()
    }

    const updateEventListeners = () => {
        const windowWidth = window.innerWidth
        if (searchButton) {
            if (windowWidth >= MOBILE_WIDTH && !hasEvent) {
                searchButton.addEventListener('click', openDesktopMenu)
                hasEvent = true
            }
        }
    }

    const showMoreMenuItems = () => {
        showMoreTriggers.forEach((item) => {
            const button = item.querySelector('.js-show-more')
            if (button && !isShowMoreEventAttached) {
                button.addEventListener('click', () => {
                    const categoryId = button.getAttribute('data-show-more')
                    const listItems = document.querySelectorAll(`.js-navigation-list-item[data-more="${categoryId}"]`)
                    button.classList.toggle('is-open')

                    const buttonLabels = button.querySelectorAll('.js-show-label')
                    if (listItems.length > 0) {
                        listItems.forEach((listItem) => {
                            listItem.classList.toggle('is-hidden')
                        })

                        buttonLabels.forEach((label) => {
                            label.classList.toggle('is-hidden')
                        })
                    }
                })
            }
        })

        isShowMoreEventAttached = true
    }

    updateEventListeners()

    showMoreMenuItems()

    window.addEventListener('resize', updateEventListeners)
}
