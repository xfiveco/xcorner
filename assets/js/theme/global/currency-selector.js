import utils from '@bigcommerce/stencil-utils'
import { showAlertModal } from './modal'
import q$, { q$$ } from './selector'

let currencySelectorCalled = false

export default function (cartId) {
    if (!cartId) return

    if (!currencySelectorCalled) {
        currencySelectorCalled = true
    } else {
        return
    }

    function changeCurrency(url, currencyCode, currencySessionSwitcher) {
        fetch(url, {
            method: 'POST',
            headers: {
                contentType: 'application/json',
            },
            body: JSON.stringify({ currencyCode }),
        })
            .then(() => {
                window.location.href = currencySessionSwitcher
            })
            .catch((e) => showAlertModal(JSON.parse(e.responseText).error))
    }

    q$$('[data-cart-currency-switch-url]').forEach(($currencySwitch) => {
        $currencySwitch.addEventListener('click', (event) => {
            const currencySessionSwitcher = event.target.href
            event.preventDefault()

            utils.api.cart.getCart({ cartId }, (err, response) => {
                if (err || response === undefined) {
                    window.location.href = currencySessionSwitcher
                    return
                }

                const showWarning =
                    response.discounts.some((discount) => discount.discountedAmount > 0) ||
                    response.coupons.length > 0 ||
                    response.lineItems.giftCertificates.length > 0

                if (showWarning) {
                    const text = event.target.dataset.warning
                    const $preModalFocusedEl = q$('.js-nav-user-action-currency-selector')

                    showAlertModal(text, {
                        icon: 'warning',
                        showCancelButton: true,
                        $preModalFocusedEl,
                        onConfirm: () => {
                            changeCurrency(
                                event.target.dataset.cartCurrencySwitchUrl,
                                event.target.dataset.currencyCode,
                                currencySessionSwitcher,
                            )
                        },
                    })
                } else {
                    changeCurrency(
                        event.target.dataset.cartCurrencySwitchUrl,
                        event.target.dataset.currencyCode,
                        currencySessionSwitcher,
                    )
                }
            })
        })
    })
}
