import Wishlist from '../wishlist'
import { initRadioOptions } from './aria'
import toggleOption from './select-option-plugin'
import q$, { q$$ } from '../global/selector'
import trigger from './utils/trigger'
import isVisible from './utils/is-visible'

const optionsTypesMap = {
    INPUT_FILE: 'input-file',
    INPUT_TEXT: 'input-text',
    INPUT_NUMBER: 'input-number',
    INPUT_CHECKBOX: 'input-checkbox',
    TEXTAREA: 'textarea',
    DATE: 'date',
    SET_SELECT: 'set-select',
    SET_RECTANGLE: 'set-rectangle',
    SET_RADIO: 'set-radio',
    SWATCH: 'swatch',
    PRODUCT_LIST: '.js-product-list',
}

export function optionChangeDecorator(areDefaultOtionsSet) {
    return (err, response) => {
        const attributesData = response.data || {}
        const attributesContent = response.content || {}

        this.updateProductAttributes(attributesData)
        if (areDefaultOtionsSet) {
            this.updateView(attributesData, attributesContent)
        } else {
            this.updateDefaultAttributesForOOS(attributesData)
        }
    }
}

export default class ProductDetailsBase {
    constructor($scope, context) {
        this.$scope = $scope
        this.context = context
        this.initRadioAttributes()
        Wishlist.load(this.context)
        this.getTabRequests()

        q$$('[data-product-attribute]').forEach((value) => {
            const type = value.dataset.productAttribute

            this._makeProductVariantAccessible(value, type)
        })
    }

    _makeProductVariantAccessible(variantDomNode, variantType) {
        switch (variantType) {
            case optionsTypesMap.SET_RADIO:
            case optionsTypesMap.SWATCH: {
                initRadioOptions(variantDomNode, '[type=radio]')
                break
            }

            default:
                break
        }
    }

    /**
     * Allow radio buttons to get deselected
     */
    initRadioAttributes() {
        q$$('[data-product-attribute] input[type="radio"]', this.$scope).forEach(($radio) => {
            // Only bind to click once
            if ($radio.dataset.state !== undefined) {
                $radio.addEventListener('click', () => {
                    if ($radio.dataset.state === true) {
                        /* eslint-disable no-param-reassign */
                        $radio.checked = false
                        $radio.dataset.state = false

                        trigger($radio, 'change')
                    } else {
                        $radio.dataset.state = true
                    }

                    this.initRadioAttributes()
                })
            }

            $radio.dataset.state = $radio.checked
        })
    }

    /**
     * Hide or mark as unavailable out of stock attributes if enabled
     * @param  {Object} data Product attribute data
     */
    updateProductAttributes(data) {
        const behavior = data.out_of_stock_behavior
        const inStockIds = data.in_stock_attributes
        const outOfStockMessage = ` (${data.out_of_stock_message})`

        if (behavior !== 'hide_option' && behavior !== 'label_option') {
            return
        }

        q$$('[data-product-attribute-value]', this.$scope).forEach(($attribute) => {
            const attrId = parseInt($attribute.dataset.productAttributeValue, 10)

            if (inStockIds.indexOf(attrId) !== -1) {
                this.enableAttribute($attribute, behavior, outOfStockMessage)
            } else {
                this.disableAttribute($attribute, behavior, outOfStockMessage)
            }
        })
    }

    /**
     * Check for fragment identifier in URL requesting a specific tab
     */
    getTabRequests() {
        if (window.location.hash && window.location.hash.indexOf('#tab-') === 0) {
            const $activeTab = q$$('.js-tabs').filter(($tab) => $tab.matches(`[href='${window.location.hash}']`))
            const $tabContent = q$(`${window.location.hash}`)

            if ($activeTab.length > 0) {
                const $tab = $activeTab[0].querySelector('.js-tab')

                $tab.addClass.classList.removeClass('is-active')
                $tab.matches(`[href='${window.location.hash}']`)
                $tab.classList.add('is-active')

                $tabContent.classList.add('is-active')
                $tabContent.children.forEach(($child) => $child.classList.remove('is-active'))
            }
        }
    }

    /**
     * Since $productView can be dynamically inserted using render_with,
     * We have to retrieve the respective elements
     *
     * @param {HTMLElement} $scope
     */
    getViewModel($scope) {
        return {
            $priceWithTax: q$('.js-product-price-with-tax', $scope),
            $priceWithoutTax: q$('.js-product-price-without-tax', $scope),
            rrpWithTax: {
                $div: q$('.js-rrp-price-with-tax', $scope),
                $span: q$('.js-product-rrp-with-tax', $scope),
            },
            rrpWithoutTax: {
                $div: q$('.js-rrp-price-without-tax', $scope),
                $span: q$('.js-product-rrp-price-without-tax', $scope),
            },
            nonSaleWithTax: {
                $div: q$('.js-non-sale-price-with-tax', $scope),
                $span: q$('.js-product-non-sale-price-with-tax', $scope),
            },
            nonSaleWithoutTax: {
                $div: q$('.js-non-sale-price-without-tax', $scope),
                $span: q$('.js-product-non-sale-price-without-tax', $scope),
            },
            priceSaved: {
                $div: q$('.js-price-section-saving', $scope),
                $span: q$('.js-product-price-saved', $scope),
            },
            priceNowLabel: {
                $span: q$('.js-price-now-label', $scope),
            },
            priceLabel: {
                $span: q$('.js-price-label', $scope),
            },
            $weight: q$('.js-product-view-info [data-product-weight]', $scope),
            $increments: q$('.js-form-field-increments input', $scope),
            $addToCart: q$('.js-form-action-add-to-cart', $scope),
            $wishlistVariation: q$('.js-wishlist-add [name="variation_id"]', $scope),
            stock: {
                $container: q$('.js-form-field-stock', $scope),
                $input: q$('.js-product-stock', $scope),
            },
            sku: {
                $label: q$('.js-sku-label', $scope),
                $value: q$('.js-product-sku', $scope),
            },
            upc: {
                $label: q$('.js-upc-label', $scope),
                $value: q$('.js-product-upc', $scope),
            },
            quantity: {
                $text: q$('.js-form-input-increment-total', $scope),
                $input: q$('[name=qty\\[\\]]', $scope),
            },
            $bulkPricing: q$('.js-product-view-info-bulk-pricing', $scope),
            $walletButtons: q$('.js-add-to-cart-wallet-buttons', $scope),
        }
    }

    /**
     * Hide the pricing elements that will show up only when the price exists in API
     * @param {Object} viewModel
     */
    clearPricingNotFound(viewModel) {
        if (viewModel.rrpWithTax && viewModel.rrpWithTax.$div) {
            viewModel.rrpWithTax.$div.style.display = 'none'
        }

        if (viewModel.rrpWithoutTax && viewModel.rrpWithoutTax.$div) {
            viewModel.rrpWithoutTax.$div.style.display = 'none'
        }

        if (viewModel.nonSaleWithTax && viewModel.nonSaleWithTax.$div) {
            viewModel.nonSaleWithTax.$div.style.display = 'none'
        }

        if (viewModel.nonSaleWithoutTax && viewModel.nonSaleWithoutTax.$div) {
            viewModel.nonSaleWithoutTax.$div.style.display = 'none'
        }

        if (viewModel.priceSaved && viewModel.priceSaved.$div) {
            viewModel.priceSaved.$div.style.display = 'none'
        }

        if (viewModel.priceNowLabel && viewModel.priceNowLabel.$span) {
            viewModel.priceNowLabel.$span.style.display = 'none'
        }

        if (viewModel.priceLabel) {
            viewModel.priceLabel.$span.style.display = 'none'
        }
    }

    /**
     * Update the view of price, messages, SKU and stock options when a product option changes
     * @param  {Object} data Product attribute data
     */
    updateView(data, content = null) {
        const viewModel = this.getViewModel(this.$scope)

        this.showMessageBox(data.stock_message || data.purchasing_message)

        if (data.price instanceof Object) {
            this.updatePriceView(viewModel, data.price)
        }

        if (data.weight instanceof Object) {
            viewModel.$weight.innerHTML = data.weight.formatted
        }

        // Set variation_id if it exists for adding to wishlist
        if (data.variantId) {
            viewModel.$wishlistVariation.value = data.variantId
        }

        // If SKU is available
        if (data.sku) {
            viewModel.sku.$value.textContent = data.sku
            viewModel.sku.$label.style.display = 'block'
        } else {
            viewModel.sku.$label.style.display = 'none'
            viewModel.sku.$value.textContent = ''
        }

        // If UPC is available
        if (data.upc) {
            viewModel.upc.$value.textContent = data.upc
            viewModel.upc.$label.style.display = 'block'
        } else {
            viewModel.upc.$label.style.display = 'none'
            viewModel.upc.$value.textContent = ''
        }

        // if stock view is on (CP settings)
        if (viewModel.stock.$container && typeof data.stock === 'number') {
            // if the stock container is hidden, show
            viewModel.stock.$container.classList.remove('u-hidden-visually')

            viewModel.stock.$input.textContent = data.stock
        } else {
            /* eslint-disable no-unused-expressions */
            viewModel.stock.$container?.classList.add('u-hidden-visually')
            viewModel.stock.$input.textConent = data.stock
        }

        this.updateDefaultAttributesForOOS(data)
        this.updateWalletButtonsView(data)

        // If Bulk Pricing rendered HTML is available
        if (data.bulk_discount_rates && content && typeof content !== 'object') {
            viewModel.$bulkPricing.innerHTML = content
        } else if (typeof data.bulk_discount_rates !== 'undefined') {
            viewModel.$bulkPricing.innerHTML = ''
        }

        const addToCartWrapper = q$('#add-to-cart-wrapper')

        if (isVisible(addToCartWrapper) === false && data.purchasable) {
            addToCartWrapper.style.display = 'block'
        }
    }

    /**
     * Update the view of price, messages, SKU and stock options when a product option changes
     * @param  {Object} viewModel Product attribute data
     * @param  {Object} price
     */
    updatePriceView(viewModel, price) {
        this.clearPricingNotFound(viewModel)

        if (price.with_tax) {
            const updatedPrice = price.price_range
                ? `${price.price_range.min.with_tax.formatted} - ${price.price_range.max.with_tax.formatted}`
                : price.with_tax.formatted
            viewModel.priceLabel.$span.style.display = 'block'
            viewModel.$priceWithTax.innerHTML = updatedPrice
        }

        if (price.without_tax) {
            const updatedPrice = price.price_range
                ? `${price.price_range.min.without_tax.formatted} - ${price.price_range.max.without_tax.formatted}`
                : price.without_tax.formatted
            viewModel.priceLabel.$span.style.display = 'block'
            viewModel.$priceWithoutTax.innerHTML = updatedPrice
        }

        if (price.rrp_with_tax) {
            viewModel.rrpWithTax.$div.style.display = 'block'
            viewModel.rrpWithTax.$span.innerHTML = price.rrp_with_tax.formatted
        }

        if (price.rrp_without_tax) {
            viewModel.rrpWithoutTax.$div.style.display = 'block'
            viewModel.rrpWithoutTax.$span.innerHTML = price.rrp_without_tax.formatted
        }

        if (price.saved) {
            viewModel.priceSaved.$div.style.display = 'block'
            viewModel.priceSaved.$span.innerHTML = price.saved.formatted
        }

        if (price.non_sale_price_with_tax) {
            viewModel.priceLabel.$span.style.display = 'none'
            viewModel.nonSaleWithTax.$div.style.display = 'block'
            viewModel.priceNowLabel.$span.style.display = 'block'
            viewModel.nonSaleWithTax.$span.innerHTML = price.non_sale_price_with_tax.formatted
        }

        if (price.non_sale_price_without_tax) {
            viewModel.priceLabel.$span.style.display = 'none'
            viewModel.nonSaleWithoutTax.$div.style.display = 'block'
            viewModel.priceNowLabel.$span.style.display = 'block'
            viewModel.nonSaleWithoutTax.$span.innerHTML = price.non_sale_price_without_tax.formatted
        }
    }

    /**
     * Show an message box if a message is passed
     * Hide the box if the message is empty
     * @param  {String} message
     */
    showMessageBox(message) {
        const $messageBox = q$('.js-product-attributes-message')

        if (message) {
            q$('.js-alert-box-message', $messageBox).textContent = message
            $messageBox.style.display = 'block'
        } else {
            $messageBox.style.display = 'none'
        }
    }

    /**
     * Enables/disables by purchasable and instock
     * @param {Object} data
     */
    updateDefaultAttributesForOOS(data) {
        const viewModel = this.getViewModel(this.$scope)
        if (!data.purchasable || !data.instock) {
            viewModel.$addToCart.disabled = true

            if (viewModel.$increments) {
                viewModel.$increments.disabled = true
            }
        } else {
            viewModel.$addToCart.disabled = false

            if (viewModel.$increments) {
                viewModel.$increments.disabled = false
            }
        }
    }

    /**
     * @param {Object} data
     */
    updateWalletButtonsView(data) {
        this.toggleWalletButtonsVisibility(data.purchasable && data.instock)
    }

    /**
     * Set wallet button visibility
     *
     * @param {Boolean} shouldShow
     */
    toggleWalletButtonsVisibility(shouldShow) {
        const viewModel = this.getViewModel(this.$scope)

        if (shouldShow) {
            viewModel.$walletButtons.style.display = 'block'
        } else {
            viewModel.$walletButtons.style.display = 'none'
        }
    }

    /**
     * Enables selected attribute
     *
     * @param {HTMLElement} $attribute
     * @param {string} behavior
     * @param {string} outOfStockMessage
     */
    enableAttribute($attribute, behavior, outOfStockMessage) {
        if (this.getAttributeType($attribute) === 'set-select') {
            return this.enableSelectOptionAttribute($attribute, behavior, outOfStockMessage)
        }

        if (behavior === 'hide_option') {
            $attribute.style.display = 'block'
        } else {
            $attribute.classList.remove('unavailable')
        }
    }

    /**
     * Disables selected attributed
     *
     * @param {HTMLElement} $attribute
     * @param {string} behavior
     * @param {string} outOfStockMessage
     */
    disableAttribute($attribute, behavior, outOfStockMessage) {
        if (this.getAttributeType($attribute) === 'set-select') {
            return this.disableSelectOptionAttribute($attribute, behavior, outOfStockMessage)
        }

        if (behavior === 'hide_option') {
            $attribute.style.display = 'none'
        } else {
            $attribute.classList.add('unavailable')
        }
    }

    /**
     * Gets attribuet from parent
     *
     * @param {HTMLElement} $attribute
     * @returns {Object|null}
     * @memberof ProductDetailsBase
     */
    getAttributeType($attribute) {
        const $parent = $attribute.closest('[data-product-attribute]')

        return $parent ? $parent.dataset.productAttribute : null
    }

    /**
     * Disables Select option attribute
     *
     * @param {HTMLElement} $attribute
     * @param {string} behavior
     * @param {string} outOfStockMessage
     */
    disableSelectOptionAttribute($attribute, behavior, outOfStockMessage) {
        const $select = $attribute.parentNode

        if (behavior === 'hide_option') {
            toggleOption($attribute, false)
            // If the attribute is the selected option in a select dropdown, select the first option (MERC-639)
            if ($select.value === $attribute.value) {
                $select[0].selectedIndex = 0
            }
        } else {
            $attribute.disabled = 'disabled'
            $attribute.innerHTML = $attribute.innerHTML.replace(outOfStockMessage, '') + outOfStockMessage
        }
    }

    /**
     * Enables select option attribute
     *
     * @param {HTMLElement} $attribute
     * @param {string} behavior
     * @param {string} outOfStockMessage
     */
    enableSelectOptionAttribute($attribute, behavior, outOfStockMessage) {
        if (behavior === 'hide_option') {
            toggleOption($attribute, true)
        } else {
            $attribute.disabled = false
            $attribute.innerHTML = $attribute.innerHTML.replace(outOfStockMessage, '')
        }
    }
}
