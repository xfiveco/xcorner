import utils from '@bigcommerce/stencil-utils'
import { isEmpty, isPlainObject } from 'lodash'
import ProductDetailsBase, { optionChangeDecorator } from './product-details-base'
import ImageGallery from '../product/image-gallery'
import modalFactory, { alertModal, showAlertModal } from '../global/modal'
import nod from './nod'
import { announceInputErrorMessage } from './utils/form-utils'
import forms from './models/forms'
import { normalizeFormData } from './utils/api'
import { isBrowserIE, convertIntoArray } from './utils/ie-helpers'
import bannerUtils from './utils/banner-utils'
import currencySelector from '../global/currency-selector'
import q$, { q$$, parents } from '../global/selector'
import trigger from './utils/trigger'
import addToCartWithModal from '../custom/add-to-cart-modal'

export default class ProductDetails extends ProductDetailsBase {
    constructor($scope, context, productAttributesData = {}) {
        super($scope, context)

        this.$overlay = q$('.js-cart-item-add .js-loading-overlay')
        this.imageGallery = new ImageGallery(q$('.js-image-gallery', this.$scope))
        this.imageGallery.init()
        this.listenQuantityChange()
        this.$swatchOptionMessage = q$('.swatch-option-message')
        this.swatchInitMessageStorage = {}
        this.swatchGroupIdList = q$$('[id^="swatchGroup"]').map(($group) => $group.id)
        this.storeInitMessagesForSwatches()

        const $form = q$('.js-cart-item-add', $scope)

        if ($form.checkValidity()) {
            this.updateProductDetailsData()
        } else {
            this.toggleWalletButtonsVisibility(false)
        }

        this.addToCartValidator = nod({
            submit: $form.querySelector('.js-form-action-add-to-cart'),
            tap: announceInputErrorMessage,
        })

        const $productOptionsElement = q$('.js-product-option-change', $form)
        const hasOptions = $productOptionsElement.innerHTML.trim().length
        const hasDefaultOptions = $productOptionsElement.querySelector('.js-default') !== null
        const $productSwatchGroup = q$$('[id*="attribute_swatch"]', $form)
        const $productSwatchLabels = q$$('.form-option-swatch', $form)
        const placeSwatchLabelImage = ($label) => {
            const $optionImage = q$('.form-option-expanded', $label)
            const optionImageWidth = $optionImage.offsetWidth()
            const extendedOptionImageOffsetLeft = 55
            const { right } = $label.getBoundingClientRect()
            const emptySpaceToScreenRightBorder = window.screen.width - right
            const shiftValue = optionImageWidth - emptySpaceToScreenRightBorder

            if (emptySpaceToScreenRightBorder < optionImageWidth + extendedOptionImageOffsetLeft) {
                $optionImage.style.left = `${shiftValue > 0 ? -shiftValue : shiftValue}px`
            }
        }

        window.addEventListener('load', () => {
            this.registerAddToCartValidation()
            $productSwatchLabels.forEach(placeSwatchLabelImage)
        })

        if (context.showSwatchNames) {
            this.$swatchOptionMessage?.classList.remove('u-hidden-visually')

            $productSwatchGroup.forEach(($swatch) => {
                $swatch.addEventListener('change', ({ target }) => {
                    const swatchGroupElement = target.parentNode.parentNode

                    this.showSwatchNameOnOption(target, swatchGroupElement)
                })

                const $swatchGroupElement = $swatch.parentNode.parentNode

                if ($swatch.checked) this.showSwatchNameOnOption($swatch, $swatchGroupElement)
            })
        }

        $productOptionsElement.addEventListener('change', (event) => {
            this.productOptionsChanged(event)
            this.setProductVariant()
        })

        $form.addEventListener('submit', (event) => {
            this.addToCartValidator.performCheck()

            if (this.addToCartValidator.areAll('valid')) {
                this.addProductToCart(event, $form)
            }
        })

        // Update product attributes. Also update the initial view in case items are oos
        // or have default variant properties that change the view
        if ((isEmpty(productAttributesData) || hasDefaultOptions) && hasOptions) {
            const $productId = q$('[name="product_id"]', $form).value
            const optionChangeCallback = optionChangeDecorator.call(this, hasDefaultOptions)

            utils.api.productAttributes.optionChange(
                $productId,
                Object.fromEntries(new FormData($form)),
                'products/bulk-discount-rates',
                optionChangeCallback,
            )
        } else {
            this.updateProductAttributes(productAttributesData)
            bannerUtils.dispatchProductBannerEvent(productAttributesData)
        }

        $productOptionsElement.style.display = 'block'

        this.previewModal = modalFactory('.js-preview-modal')

        addToCartWithModal('[data-button-type="add-cart"]', this.context, this.previewModal)
    }

    registerAddToCartValidation() {
        this.addToCartValidator.add([
            {
                selector: '.js-quantity-change > .js-form-input-increment-total',
                validate: (cb, val) => {
                    const result = forms.numbersOnly(val)
                    cb(result)
                },
                errorMessage: this.context.productQuantityErrorMessage,
            },
        ])

        return this.addToCartValidator
    }

    storeInitMessagesForSwatches() {
        if (this.swatchGroupIdList.length && isEmpty(this.swatchInitMessageStorage)) {
            this.swatchGroupIdList.forEach((swatchGroupId) => {
                if (!this.swatchInitMessageStorage[swatchGroupId]) {
                    this.swatchInitMessageStorage[swatchGroupId] = q$(`#${swatchGroupId} ~ .swatch-option-message`)?.textContent.trim()
                }
            })
        }
    }

    setProductVariant() {
        const unsatisfiedRequiredFields = []
        const options = []

        q$$('[data-product-attribute]').forEach((value) => {
            const optionLabel = value.children[0].innerText
            const optionTitle = optionLabel.split(':')[0].trim()
            const required = optionLabel.toLowerCase().includes('required')
            const type = value.dataset.productAttribute

            if (
                (type === 'input-file' || type === 'input-text' || type === 'input-number') &&
                value.querySelector('input').value === '' &&
                required
            ) {
                unsatisfiedRequiredFields.push(value)
            }

            if (type === 'textarea' && value.querySelector('textarea').value === '' && required) {
                unsatisfiedRequiredFields.push(value)
            }

            if (type === 'date') {
                const isSatisfied = Array.from(value.querySelectorAll('select')).every((select) => select.selectedIndex !== 0)

                if (isSatisfied) {
                    const dateString = Array.from(value.querySelectorAll('select'))
                        .map((x) => x.value)
                        .join('-')
                    options.push(`${optionTitle}:${dateString}`)

                    return
                }

                if (required) {
                    unsatisfiedRequiredFields.push(value)
                }
            }

            if (type === 'set-select') {
                const select = value.querySelector('select')
                const selectedIndex = select.selectedIndex

                if (selectedIndex !== 0) {
                    options.push(`${optionTitle}:${select.options[selectedIndex].innerText}`)

                    return
                }

                if (required) {
                    unsatisfiedRequiredFields.push(value)
                }
            }

            if (type === 'set-rectangle' || type === 'set-radio' || type === 'swatch' || type === 'input-checkbox' || type === 'js-product-list') {
                const checked = value.querySelector(':checked')

                if (checked) {
                    const getSelectedOptionLabel = () => {
                        const productVariantslist = convertIntoArray(value.children)
                        const matchLabelForCheckedInput = (inpt) => inpt.dataset.productAttributeValue === checked.value
                        return productVariantslist.filter(matchLabelForCheckedInput)[0]
                    }
                    if (type === 'set-rectangle' || type === 'set-radio' || type === 'js-product-list') {
                        const label = isBrowserIE ? getSelectedOptionLabel().innerText.trim() : checked.labels[0].innerText
                        if (label) {
                            options.push(`${optionTitle}:${label}`)
                        }
                    }

                    if (type === 'swatch') {
                        const label = isBrowserIE ? getSelectedOptionLabel().children[0] : checked.labels[0].children[0]
                        if (label) {
                            options.push(`${optionTitle}:${label.title}`)
                        }
                    }

                    if (type === 'input-checkbox') {
                        options.push(`${optionTitle}:Yes`)
                    }

                    return
                }

                if (type === 'input-checkbox') {
                    options.push(`${optionTitle}:No`)
                }

                if (required) {
                    unsatisfiedRequiredFields.push(value)
                }
            }
        })

        let productVariant = unsatisfiedRequiredFields.length === 0 ? options.sort().join(', ') : 'unsatisfied'
        const $view = q$('.js-product-view')

        if (productVariant) {
            productVariant = productVariant === 'unsatisfied' ? '' : productVariant
            if ($view.dataset.eventType) {
                $view.data.productVariant = productVariant
            } else {
                const productName = $view.querySelector('.js-product-view-title').innerText.replace(/"/g, '\\$&')
                const card = q$(`[data-name="${productName}"]`)

                if (card === null) {
                    return
                }

                card.dataset.productVariant = productVariant
            }
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

    /**
     * Handle product options changes
     * @param {Event} event
     */
    productOptionsChanged(event) {
        const $changedOption = event.target
        const $form = parents('form', $changedOption)[0]
        const productId = q$('[name="product_id"]', $form).value

        // Do not trigger an ajax request if it's a file or if the browser doesn't support FormData
        if ($changedOption.type === 'file' || window.FormData === undefined) {
            return
        }

        utils.api.productAttributes.optionChange(
            productId,
            Object.fromEntries(new FormData($form)),
            'products/bulk-discount-rates',
            (err, response) => {
                const productAttributesData = response.data || {}
                const productAttributesContent = response.content || {}
                this.updateProductAttributes(productAttributesData)
                this.updateView(productAttributesData, productAttributesContent)
                this.updateProductDetailsData()
                bannerUtils.dispatchProductBannerEvent(productAttributesData)

                if (!this.checkIsQuickViewChild($form)) {
                    const $context = parents('.js-product-view', $form)[0].querySelector('.js-product-view-info')
                    modalFactory('.js-reveal', { $context })
                }
            },
        )
    }

    /**
     * if this setting is enabled in Page Builder
     * show name for swatch option
     * @param {HTMLElement} $swatch
     * @param {HTMLElement} $swatchGroup
     */
    showSwatchNameOnOption($swatch, $swatchGroup) {
        const swatchName = $swatch.getAttribute('aria-label')
        const activeSwatchGroupId = $swatchGroup.getAttribute('aria-labelledby')
        const $swatchOptionMessage = q$(`#${activeSwatchGroupId} ~ .swatch-option-message`)

        q$('.js-option-value', $swatchGroup).textContent = swatchName

        if (this.$swatchOptionMessage) {
            $swatchOptionMessage.textContent = `${this.swatchInitMessageStorage[activeSwatchGroupId]} ${swatchName}`
            this.setLiveRegionAttributes($swatchOptionMessage, 'status', 'assertive')
        }
    }

    /**
     * @param {HTMLElement} $element
     * @param {string} roleType
     * @param {string} ariaLiveStatus
     * @memberof ProductDetails
     */
    setLiveRegionAttributes($element, roleType, ariaLiveStatus) {
        try {
            $element.setAttribute('role', roleType)
            $element.setAttribute('aria-live', ariaLiveStatus)
        } catch (error) {
            /* NOOP */
        }
    }

    /**
     * @param {HTMLElement} $element
     * @returns {Boolean}
     */
    checkIsQuickViewChild($element) {
        return !!parents('.js-quick-view', $element).length
    }

    /**
     * @param {Object} image
     */
    showProductImage(image) {
        if (isPlainObject(image)) {
            const zoomImageUrl = utils.tools.imageSrcset.getSrcset(
                image.data,
                { '1x': this.context.zoomSize },
                /*
                    Should match zoom size used for data-zoom-image in
                    components/products/product-view.html

                    Note that this will only be used as a fallback image for browsers that do not support srcset

                    Also note that getSrcset returns a simple src string when exactly one size is provided
                */
            )

            const mainImageUrl = utils.tools.imageSrcset.getSrcset(
                image.data,
                { '1x': this.context.productSize },
                /*
                    Should match fallback image size used for the main product image in
                    components/products/product-view.html

                    Note that this will only be used as a fallback image for browsers that do not support srcset

                    Also note that getSrcset returns a simple src string when exactly one size is provided
                */
            )

            const mainImageSrcset = utils.tools.imageSrcset.getSrcset(image.data)

            this.imageGallery.setAlternateImage({
                mainImageUrl,
                zoomImageUrl,
                mainImageSrcset,
            })
        } else {
            this.imageGallery.restoreImage()
        }
    }

    /**
     * Handle action when the shopper clicks on + / - for quantity
     */
    listenQuantityChange() {
        q$('.js-quantity-change button', this.$scope)?.addEventListener('click', (event) => {
            event.preventDefault()
            const $target = event.currentTarget
            const viewModel = this.getViewModel(this.$scope)
            const $input = viewModel.quantity.$input
            const quantityMin = parseInt($input.dataset.quantityMin, 10)
            const quantityMax = parseInt($input.dataset.quantityMax, 10)

            let qty = forms.numbersOnly($input.value) ? parseInt($input.value, 10) : quantityMin
            // If action is incrementing
            if ($target.dataset.action === 'inc') {
                qty = forms.validateIncreaseAgainstMaxBoundary(qty, quantityMax)
            } else if (qty > 1) {
                qty = forms.validateDecreaseAgainstMinBoundary(qty, quantityMin)
            }

            // update hidden input
            viewModel.quantity.$input.value = qty
            // update text
            viewModel.quantity.$text.textContent = qty
            // perform validation after updating product quantity
            this.addToCartValidator.performCheck()

            this.updateProductDetailsData()
        })

        // Prevent triggering quantity change when pressing enter
        q$('.js-form-input-increment-total', this.$scope)?.addEventListener('keypress', (event) => {
            // If the browser supports event.which, then use event.which, otherwise use event.keyCode
            const x = event.which || event.keyCode
            if (x === 13) {
                // Prevent default
                event.preventDefault()
            }
        })

        q$('.js-form-input-increment-total', this.$scope)?.addEventListener('keyup', () => {
            this.updateProductDetailsData()
        })
    }

    /**
     * Add a product to cart
     *
     * @param {Event} event
     * @param {HTMLFormElement} form
     */
    addProductToCart(event, form) {
        const $addToCartBtn = q$('.js-form-action-add-to-cart', event.target)
        const originalBtnVal = $addToCartBtn.value
        const waitMessage = $addToCartBtn.dataset.waitMessage

        // Do not do AJAX if browser doesn't support FormData
        if (window.FormData === undefined) {
            return
        }

        // Prevent default
        event.preventDefault()

        $addToCartBtn.textContent = waitMessage
        $addToCartBtn.disabled = true

        if (this.$overlay) {
            this.$overlay.style.display = 'block'
        }

        // Add item to cart
        utils.api.cart.itemAdd(normalizeFormData(new FormData(form)), (err, response) => {
            currencySelector(response?.data.cart_id)
            const errorMessage = err || response.data.error

            $addToCartBtn.textContent = originalBtnVal
            $addToCartBtn.disabled = false

            if (this.$overlay) {
                this.$overlay.style.display = 'none'
            }

            // Guard statement
            if (errorMessage) {
                // Strip the HTML from the error message
                const tmp = document.createElement('div')
                tmp.innerHTML = errorMessage

                if (!this.checkIsQuickViewChild($addToCartBtn)) {
                    alertModal().$preModalFocusedEl = $addToCartBtn
                }

                return showAlertModal(tmp.textContent || tmp.innerText)
            }

            // Open preview modal and update content
            if (this.previewModal) {
                this.previewModal.open()

                if (window.ApplePaySession) {
                    this.previewModal.$modal.classList.add('js-apple-pay-supported')
                }

                if (!this.checkIsQuickViewChild($addToCartBtn)) {
                    this.previewModal.$preModalFocusedEl = $addToCartBtn
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

        this.setLiveRegionAttributes($addToCartBtn.nextSibling, 'status', 'polite')
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
     * Hide or mark as unavailable out of stock attributes if enabled
     * @param  {Object} data Product attribute data
     */
    updateProductAttributes(data) {
        super.updateProductAttributes(data)
        this.showProductImage(data.image)
    }

    updateProductDetailsData() {
        const $form = q$('.js-cart-item-add')
        const formDataItems = new FormData($form)

        const productDetails = {}

        for (const [name, value] of formDataItems.entries()) {
            if (name === 'product_id') {
                productDetails.productId = Number(value)
            }

            if (name === 'qty[]') {
                productDetails.quantity = Number(value)
            }

            if (name.match(/attribute/)) {
                const productOption = {
                    optionId: Number(name.match(/\d+/g)[0]),
                    optionValue: value,
                }

                productDetails.optionSelections = productDetails?.optionSelections
                    ? [...productDetails.optionSelections, productOption]
                    : [productOption]
            }
        }

        document.dispatchEvent(
            new CustomEvent('onproductupdate', {
                bubbles: true,
                detail: { productDetails },
            }),
        )
    }
}
