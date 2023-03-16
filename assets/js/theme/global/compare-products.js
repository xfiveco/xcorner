import trigger from '../common/utils/trigger'
import { showAlertModal } from './modal'
import q$, { q$$ } from './selector'

function decrementCounter(counter, item) {
    const index = counter.indexOf(item)

    if (index > -1) {
        counter.splice(index, 1)
    }
}

function incrementCounter(counter, item) {
    counter.push(item)
}

function updateCounterNav(counter, $link, urls) {
    if (counter.length !== 0) {
        if (!($link.offsetWidth > 0 && $link.offsetHeight > 0)) {
            $link.classList.add('show')
        }

        /* eslint-disable no-param-reassign */
        $link.href = `${urls.compare}/${counter.join('/')}`

        /* eslint-disable no-param-reassign */
        $link.querySelector('.js-count-pill').innerHTML = counter.length
    } else {
        $link.classList.remove('show')
    }
}

export default function ({ noCompareMessage, urls }) {
    let compareCounter = []

    const $compareLink = q$('.js-compare-nav')

    q$('body').addEventListener('compare-reset', () => {
        const $checked = q$$('input[name="products[]"]:checked', q$('body'))

        compareCounter = $checked.length ? $checked.map((element) => element.value) : []
        updateCounterNav(compareCounter, $compareLink, urls)
    })

    trigger(q$('body'), 'compare-reset')

    /* eslint-disable no-unused-expressions */
    q$$('[data-compare-id]').forEach(($compare) => {
        $compare.addEventListener('click', (event) => {
            const product = event.currentTarget.value
            const $clickedCompareLink = q$('.js-compare-nav')

            if (event.currentTarget.checked) {
                incrementCounter(compareCounter, product)
            } else {
                decrementCounter(compareCounter, product)
            }

            updateCounterNav(compareCounter, $clickedCompareLink, urls)
        })
    })

    q$('.js-compare-nav').addEventListener('click', () => {
        const $clickedCheckedInput = q$$('input[name="products[]"]:checked', q$('body'))

        if ($clickedCheckedInput.length <= 1) {
            showAlertModal(noCompareMessage)
            return false
        }
    })
}
