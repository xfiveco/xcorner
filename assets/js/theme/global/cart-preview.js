import utils from '@bigcommerce/stencil-utils'
import trigger from '../common/utils/trigger'
import q$ from './selector'

export const CartPreviewEvents = {
    close: 'closed.fndtn.dropdown',
    open: 'opened.fndtn.dropdown',
}

export default function (secureBaseUrl, cartId) {
    const loadingClass = 'is-loading'
    const $cart = q$('.js-cart-preview')
    const $cartDropdown = q$('.js-cart-preview-dropdown')
    const $cartLoading = document.createElement('div')
    $cartLoading.classList.add('js-loading-overlay')

    if (window.ApplePaySession) {
        $cartDropdown.classList.add('js-apple-pay-supported')
    }

    q$('body').addEventListener('cart-quantity-update', (event) => {
        const quantity = event.detail
        $cart.setAttribute('aria-label', $cart.getAttribute('aria-label').replace(/\d+/, quantity))

        if (!quantity) {
            $cart.classList.add('is-nav-user-item-cart-hidden')
        } else {
            $cart.classList.remove('is-nav-user-item-cart-hidden')
        }

        const $cartQuantity = q$('.js-cart-quantity')
        $cartQuantity.textContent = quantity

        if (quantity > 0) {
            $cartQuantity.classList.add('is-positive')
        }

        if (utils.tools.storage.localStorageAvailable()) {
            localStorage.setItem('cart-quantity', quantity)
        }
    })

    $cart.addEventListener('click', (event) => {
        const options = {
            template: 'common/cart-preview',
        }

        // Redirect to full cart page
        //
        // https://developer.mozilla.org/en-US/docs/Browser_detection_using_the_user_agent
        // In summary, we recommend looking for the string 'Mobi' anywhere in the User Agent to detect a mobile device.
        if (/Mobi/i.test(navigator.userAgent)) {
            return event.stopPropagation()
        }

        if ($cart.hasClass('js-cart-disable-preview')) {
            event.preventDefault()

            $cartDropdown.classList.add(loadingClass)
            $cartDropdown.append($cartLoading)
            $cartLoading.style.display = 'block'

            utils.api.cart.getContent(options, (err, response) => {
                $cartDropdown.classList.remove(loadingClass)
                $cartDropdown.innerHTML = response
                $cartLoading.style.display = 'none'
            })
        }
    })

    let quantity = 0

    if (cartId) {
        // Get existing quantity from localStorage if found
        if (utils.tools.storage.localStorageAvailable()) {
            if (localStorage.getItem('cart-quantity')) {
                quantity = Number(localStorage.getItem('cart-quantity'))
                trigger(q$('body'), 'cart-quantity-update', quantity)
            }
        }

        // Get updated cart quantity from the Cart API
        const cartQtyPromise = new Promise((resolve, reject) => {
            utils.api.cart.getCartQuantity({ baseUrl: secureBaseUrl, cartId }, (err, qty) => {
                if (err) {
                    // If this appears to be a 404 for the cart ID, set cart quantity to 0
                    if (err === 'Not Found') {
                        resolve(0)
                    } else {
                        reject(err)
                    }
                }
                resolve(qty)
            })
        })

        // If the Cart API gives us a different quantity number, update it
        cartQtyPromise.then((qty) => {
            quantity = qty
            trigger(q$('body'), 'cart-quantity-update', quantity)
        })
    } else {
        trigger(q$('body'), 'cart-quantity-update', quantity)
    }
}
