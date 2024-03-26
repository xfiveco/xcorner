import q$, { q$$ } from './selector'

const selectors = {
    LSProducts: 'compare-products',
    link: '.js-compare-nav',
    dataCompareCard: 'data-compare-card',
    counterPill: '.js-count-pill',
    removeAll: '.js-comparison-remove-all',
}

let compareCounter = localStorage.getItem(selectors.LSProducts) ? JSON.parse(localStorage.getItem(selectors.LSProducts)) : []
const $compareLink = q$(selectors.link)

function updateLocalStorageProducts() {
    localStorage.setItem(selectors.LSProducts, JSON.stringify(compareCounter))
}

function decrementCounter(item) {
    if (compareCounter.includes(item)) {
        compareCounter = compareCounter.filter((el) => el !== item)
        updateLocalStorageProducts()
    }

    /* If removing item on compare page, remove product's ID from the URL and remove DOM element */
    if (window.location.pathname.includes('compare')) {
        const pathname = window.location.href.replaceAll(`/${item}`, '')
        const url = new URL(pathname)
        window.history.replaceState(null, '', url)
        q$(`[${selectors.dataCompareCard}='${item}']`).remove()
    }
}

function incrementCounter(item) {
    if (compareCounter.includes(item)) {
        return
    }

    compareCounter.push(item)
    updateLocalStorageProducts()
}

export function updateCounterNav(urls) {
    /* eslint-disable no-param-reassign */
    $compareLink.href = `${urls.compare}/${compareCounter.join('/')}`

    /* eslint-disable no-param-reassign */
    $compareLink.querySelector(selectors.counterPill).innerHTML = compareCounter && compareCounter.length > 0 ? compareCounter.length : ''
}

export default function compareProducts({ urls }) {
    /* eslint-disable no-unused-expressions */
    q$$('[data-compare-id]').forEach(($compare) => {
        $compare.checked = compareCounter.includes($compare.value)
        $compare.addEventListener('click', (event) => {
            const product = event.currentTarget.value

            if (event.currentTarget.checked) {
                incrementCounter(product)
            } else {
                decrementCounter(product)
            }

            updateCounterNav(urls)
        })
    })

    q$(selectors.removeAll)?.addEventListener('click', () => {
        localStorage.setItem(selectors.LSProducts, JSON.stringify([]))
        compareCounter = []
        updateCounterNav(urls)
        window.location.pathname = urls.compare
    })
}
