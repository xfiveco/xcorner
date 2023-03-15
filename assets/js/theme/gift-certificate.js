import { api } from '@bigcommerce/stencil-utils'
import PageManager from './page-manager'
import nod from './common/nod'
import checkIsGiftCertValid from './common/gift-certificate-validator'
import formModel from './common/models/forms'
import { createTranslationDictionary } from './common/utils/translations-utils'
import { announceInputErrorMessage } from './common/utils/form-utils'
import { defaultModal } from './global/modal'
import q$ from './global/selector'

export default class GiftCertificate extends PageManager {
    constructor(context) {
        super(context)
        this.validationDictionary = createTranslationDictionary(context)

        const $certBalanceForm = q$('#gift-certificate-balance')

        const purchaseModel = {
            recipientName(val) {
                return val.length
            },
            recipientEmail(...args) {
                return formModel.email(...args)
            },
            senderName(val) {
                return val.length
            },
            senderEmail(...args) {
                return formModel.email(...args)
            },
            customAmount(value, min, max) {
                return value && value >= min && value <= max
            },
            setAmount(value, options) {
                let found = false

                options.forEach((option) => {
                    if (option === value) {
                        found = true
                        return false
                    }
                })

                return found
            },
        }

        const $purchaseForm = q$('#gift-certificate-form')
        const $customAmounts = $purchaseForm?.querySelector('input[name="certificate_amount"]')
        const purchaseValidator = nod({
            submit: '#gift-certificate-form [type="submit"]',
            delay: 300,
            tap: announceInputErrorMessage,
        })

        if ($customAmounts) {
            const $element = $purchaseForm.querySelector('input[name="certificate_amount"]')
            const min = $element.dataset.min
            const minFormatted = $element.dataset.minFormatted
            const max = $element.dataset.max
            const maxFormatted = $element.dataset.maxFormatted
            const insertFormattedAmountsIntoErrorMessage = (message, ...amountRange) => {
                const amountPlaceholders = ['[MIN]', '[MAX]']
                let updatedErrorText = message
                amountPlaceholders.forEach((placeholder, i) => {
                    updatedErrorText = updatedErrorText.includes(placeholder)
                        ? updatedErrorText.replace(placeholder, amountRange[i])
                        : updatedErrorText
                })
                return updatedErrorText
            }

            purchaseValidator.add({
                selector: '#gift-certificate-form input[name="certificate_amount"]',
                validate: (cb, val) => {
                    const numberVal = Number(val)

                    if (!numberVal) {
                        cb(false)
                    }

                    cb(numberVal >= min && numberVal <= max)
                },
                errorMessage: insertFormattedAmountsIntoErrorMessage(this.validationDictionary.certificate_amount_range, minFormatted, maxFormatted),
            })
        }

        purchaseValidator.add([
            {
                selector: '#gift-certificate-form input[name="to_name"]',
                validate: (cb, val) => {
                    const result = purchaseModel.recipientName(val)

                    cb(result)
                },
                errorMessage: this.context.toName,
            },
            {
                selector: '#gift-certificate-form input[name="to_email"]',
                validate: (cb, val) => {
                    const result = purchaseModel.recipientEmail(val)

                    cb(result)
                },
                errorMessage: this.context.toEmail,
            },
            {
                selector: '#gift-certificate-form input[name="from_name"]',
                validate: (cb, val) => {
                    const result = purchaseModel.senderName(val)

                    cb(result)
                },
                errorMessage: this.context.fromName,
            },
            {
                selector: '#gift-certificate-form input[name="from_email"]',
                validate: (cb, val) => {
                    const result = purchaseModel.senderEmail(val)

                    cb(result)
                },
                errorMessage: this.context.fromEmail,
            },
            {
                selector: '#gift-certificate-form input[name="certificate_theme"]:first-of-type',
                triggeredBy: '#gift-certificate-form input[name="certificate_theme"]',
                validate: (cb) => {
                    const val = $purchaseForm.querySelector('input[name="certificate_theme"]:checked')?.value

                    cb(typeof val === 'string')
                },
                errorMessage: this.context.certTheme,
            },
            {
                selector: '#gift-certificate-form input[name="agree"]',
                validate: (cb) => {
                    const val = $purchaseForm.querySelector('input[name="agree"]').checked

                    cb(val)
                },
                errorMessage: this.context.agreeToTerms,
            },
            {
                selector: '#gift-certificate-form input[name="agree2"]',
                validate: (cb) => {
                    const val = $purchaseForm.querySelector('input[name="agree2"]').checked

                    cb(val)
                },
                errorMessage: this.context.agreeToTerms,
            },
        ])

        if ($certBalanceForm) {
            const balanceVal = this.checkCertBalanceValidator($certBalanceForm)

            $certBalanceForm.addEventListener('submit', () => {
                balanceVal.performCheck()

                if (!balanceVal.areAll('valid')) {
                    return false
                }
            })
        }

        /* eslint-disable no-unused-expressions */
        $purchaseForm?.addEventListener('submit', (event) => {
            purchaseValidator.performCheck()

            if (!purchaseValidator.areAll('valid')) {
                return event.preventDefault()
            }
        })

        q$('#gift-certificate-preview')?.addEventListener('click', (event) => {
            event.preventDefault()

            purchaseValidator.performCheck()

            if (!purchaseValidator.areAll('valid')) {
                return
            }

            const modal = defaultModal()
            const previewUrl = `${event.currentTarget.dataset.previewUrl}&${new URLSearchParams(new FormData($purchaseForm))}`

            modal.open()

            api.getPage(previewUrl, {}, (err, content) => {
                if (err) {
                    return modal.updateContent(this.context.previewError)
                }

                modal.updateContent(content, { wrap: true })
            })
        })
    }

    checkCertBalanceValidator($balanceForm) {
        const balanceValidator = nod({
            submit: $balanceForm.querySelector('[type="submit"]'),
            tap: announceInputErrorMessage,
        })

        balanceValidator.add({
            selector: $balanceForm.querySelector('input[name="giftcertificatecode"]'),
            validate(cb, val) {
                cb(checkIsGiftCertValid(val))
            },
            errorMessage: this.validationDictionary.invalid_gift_certificate,
        })

        return balanceValidator
    }
}
