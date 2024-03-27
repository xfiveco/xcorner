import q$, { q$$ } from './selector'

const selectors = {
    link: '.js-compare-nav',
    dataCompareCard: 'data-compare-card',
    counterPill: '.js-count-pill',
    removeAll: '.js-comparison-remove-all',
}

const localStorageKeys = {
    compareProducts: 'compare-products',
}

let compareProductsIDs = localStorage.getItem(localStorageKeys.compareProducts)
    ? JSON.parse(localStorage.getItem(localStorageKeys.compareProducts))
    : []
const $compareLink = q$(selectors.link)

function updateLocalStorageProducts() {
    localStorage.setItem(localStorageKeys.compareProducts, JSON.stringify(compareProductsIDs))
}

function decrementCounter(itemID) {
    if (compareProductsIDs.includes(itemID)) {
        compareProductsIDs = compareProductsIDs.filter((el) => el !== itemID)
        updateLocalStorageProducts()
    }

    /* If removing item on compare page, remove product's ID from the URL and remove DOM element */
    if (window.location.pathname.includes('compare')) {
        const pathname = window.location.href.replaceAll(`/${itemID}`, '')
        const url = new URL(pathname)
        window.history.replaceState(null, '', url)
        q$(`[${selectors.dataCompareCard}='${itemID}']`).remove()
    }
}

function incrementCounter(itemID) {
    if (compareProductsIDs.includes(itemID)) {
        return
    }

    compareProductsIDs.push(itemID)
    updateLocalStorageProducts()
}

export function updateCounterNav(urls) {
    /* eslint-disable no-param-reassign */
    $compareLink.href = `${urls.compare}/${compareProductsIDs.join('/')}`

    /* eslint-disable no-param-reassign */
    $compareLink.querySelector(selectors.counterPill).innerHTML = compareProductsIDs && compareProductsIDs.length > 0 ? compareProductsIDs.length : ''
}

export default function compareProducts({ urls }) {
    /* eslint-disable no-unused-expressions */
    q$$('[data-compare-id]').forEach(($compare) => {
        $compare.checked = compareProductsIDs.includes($compare.value)
        $compare.addEventListener('click', (event) => {
            const productID = event.currentTarget.value

            if (event.currentTarget.checked) {
                incrementCounter(productID)
            } else {
                decrementCounter(productID)
            }

            updateCounterNav(urls)
        })
    })

    q$(selectors.removeAll)?.addEventListener('click', () => {
        localStorage.setItem(localStorageKeys.compareProducts, JSON.stringify([]))
        compareProductsIDs = []
        updateCounterNav(urls)
        window.location.pathname = urls.compare
    })
}
