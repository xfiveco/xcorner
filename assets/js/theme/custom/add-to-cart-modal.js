import utils from '@bigcommerce/stencil-utils'
import { normalizeFormData } from '../common/utils/api'
import currencySelector from '../global/currency-selector'
import q$, { q$$ } from '../global/selector'
import trigger from '../common/utils/trigger'

class AddToCartWithModal {
    constructor($addToCartButtons, context, previewModal) {
        this.$addToCartButtons = $addToCartButtons
        this.previewModal = previewModal
        this.context = context

        this.init()
    }

    init() {
        this.$addToCartButtons.forEach(($addToCartButton) => {
            $addToCartButton.addEventListener('click', (event) => {
                event.preventDefault()

                const formData = new FormData()

                new URL(event.target.href).searchParams.forEach((value, key) => formData.append(key, value))

                // Add item to cart
                utils.api.cart.itemAdd(normalizeFormData(formData), (err, response) => {
                    currencySelector(response?.data.cart_id)

                    // Open preview modal and update content
                    if (this.previewModal) {
                        this.previewModal.open()

                        if (window.ApplePaySession) {
                            this.previewModal.$modal.classList.add('js-apple-pay-supported')
                        }

                        this.updateCartContent(this.previewModal, response.data.cart_item.id)
                    } else {
                        if (this.$overlay) {
                            this.$overlay.style.display = 'block'
                        }

                        // if no modal, redirect to the cart page
                        this.redirectTo(response.data.cart_item.cart_url || this.context.urls.cart)
                    }
                })
            })
        })
    }

    /**
     * Update cart content
     *
     * @param {Modal} modal
     * @param {String} cartItemId
     * @param {Function} onComplete
     */
    updateCartContent(modal, cartItemId, onComplete) {
        this.getCartContent(cartItemId, (err, response) => {
            if (err) {
                return
            }

            modal.updateContent(response)

            // Update cart counter
            const $body = q$('body')
            const $cartQuantity = q$('[data-cart-quantity]', modal.$content)
            const $cartCounter = q$('.js-nav-user-action .cart-count')
            const quantity = $cartQuantity.dataset.cartQuantity || 0
            const $promotionBanner = q$('.js-promotion-banner')
            const $backToShopppingBtn = q$('.js-preview-cart-checkout > .js-reveal-close')
            const $modalCloseBtn = q$('.js-preview-modal > .modal-close')
            const bannerUpdateHandler = () => {
                const $productContainer = q$('#main-content > .js-container') // #main-content is for jumping into that section in the page

                $productContainer.append('<div class="js-loading-overlay js-pdp-update"></div>')
                q$('.js-loading-overlay.js-pdp-update', $productContainer).style.display = 'block'
                window.location.reload()
            }

            if ($cartCounter) {
                $cartCounter.classList.add('cart-count-positive')
            }

            trigger($body, 'cart-quantity-update', quantity)

            if (onComplete) {
                onComplete(response)
            }

            if ($promotionBanner && $backToShopppingBtn) {
                $backToShopppingBtn.addEventListener('click', bannerUpdateHandler)
                $modalCloseBtn.addEventListener('click', bannerUpdateHandler)
            }
        })
    }

    /**
     * Get cart contents
     *
     * @param {String} cartItemId
     * @param {Function} onComplete
     */
    getCartContent(cartItemId, onComplete) {
        const options = {
            template: 'cart/preview',
            params: {
                suggest: cartItemId,
            },
            config: {
                cart: {
                    suggestions: {
                        limit: 4,
                    },
                },
            },
        }

        utils.api.cart.getContent(options, onComplete)
    }

    /**
     * Redirect to url
     *
     * @param {String} url
     */
    redirectTo(url) {
        if (this.isRunningInIframe() && !window.iframeSdk) {
            window.top.location = url
        } else {
            window.location = url
        }
    }

    /**
     * Checks if the current window is being run inside an iframe
     * @returns {boolean}
     */
    isRunningInIframe() {
        try {
            return window.self !== window.top
        } catch (e) {
            return true
        }
    }
}

export default function addToCartWithModal(buttonsSelector, context, previewModal) {
    const $addToCartButtons = q$$(buttonsSelector)
    if ($addToCartButtons.length === 0) {
        return
    }

    /* eslint-disable no-new */
    new AddToCartWithModal($addToCartButtons, context, previewModal)
}
