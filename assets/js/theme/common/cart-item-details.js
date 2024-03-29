import utils from '@bigcommerce/stencil-utils'
import { isEmpty } from 'lodash'
import ProductDetailsBase, { optionChangeDecorator } from './product-details-base'
import { isBrowserIE, convertIntoArray } from './utils/ie-helpers'
import q$, { q$$ } from '../global/selector'

export default class CartItemDetails extends ProductDetailsBase {
    constructor($scope, context, productAttributesData = {}) {
        super($scope, context)

        const $form = q$('.js-cart-edit-product-fields-form', this.$scope)
        const $productOptionsElement = q$('.js-product-attributes-wrapper', $form)
        const hasOptions = $productOptionsElement.innerHTML.trim().length
        const hasDefaultOptions = !!$productOptionsElement.querySelector('.js-default')

        $productOptionsElement.addEventListener('change', () => {
            this.setProductVariant()
        })

        const optionChangeCallback = optionChangeDecorator.call(this, hasDefaultOptions)

        // Update product attributes. Also update the initial view in case items are oos
        // or have default variant properties that change the view
        if ((isEmpty(productAttributesData) || hasDefaultOptions) && hasOptions) {
            const productId = this.context.productForChangeId

            utils.api.productAttributes.optionChange(
                productId,
                Object.fromEntries(new FormData($form)),
                'products/bulk-discount-rates',
                optionChangeCallback,
            )
        } else {
            this.updateProductAttributes(productAttributesData)
        }
    }

    setProductVariant() {
        const unsatisfiedRequiredFields = []
        const options = []

        q$$('[data-product-attribute]').forEach((value) => {
            const optionLabel = value.children[0].innerText
            const optionTitle = optionLabel.split(':')[0].trim()
            const required = optionLabel.toLowerCase().includes('required')
            const type = value.getAttribute('data-product-attribute')

            if (
                (type === 'input-file' || type === 'input-text' || type === 'input-number') &&
                value.querySelector('input')?.value === '' &&
                required
            ) {
                unsatisfiedRequiredFields.push(value)
            }

            if (type === 'textarea' && value.querySelector('textarea')?.value === '' && required) {
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
        const view = q$('.js-modal-header-title')

        if (productVariant) {
            productVariant = productVariant === 'unsatisfied' ? '' : productVariant
            if (view.dataset.eventType) {
                view.dataset.productVariant = productVariant
            } else {
                const productName = view.innerHTML.match(/'(.*?)'/)[1]
                const card = q$(`[data-name="${productName}"]`)
                card.dataset.productVariant = productVariant
            }
        }
    }

    /**
     * Hide or mark as unavailable out of stock attributes if enabled
     * @param  {Object} data Product attribute data
     */
    updateProductAttributes(data) {
        super.updateProductAttributes(data)

        /* eslint-disable no-unused-expressions */
        this.$scope?.querySelector('.js-modal-content')?.classList.remove('hide-content')
    }
}
