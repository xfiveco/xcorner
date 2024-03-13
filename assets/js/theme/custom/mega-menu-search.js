/**
 * Open mega menu on search button click
 */
export default function megaMenuSearch() {
    const searchButton = document.querySelector('.js-mega-menu-search')
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const megaMenu = document.querySelector('.c-navigation__megamenu')
            megaMenu.previousElementSibling.classList.toggle('is-open')
            megaMenu.classList.toggle('is-open')
        })
    }
}
