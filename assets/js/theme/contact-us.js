import PageManager from './page-manager'
import nod from './common/nod'
import forms from './common/models/forms'
import { announceInputErrorMessage } from './common/utils/form-utils'
import q$ from './global/selector'

export default class ContactUs extends PageManager {
    onReady() {
        this.registerContactFormValidation()
    }

    registerContactFormValidation() {
        const formSelector = '.js-contact-form'
        const contactUsValidator = nod({
            submit: `${formSelector} button[type="submit"]`,
            tap: announceInputErrorMessage,
        })
        const $contactForm = q$(formSelector)

        contactUsValidator.add([
            {
                selector: `${formSelector} input[name="contact_email"]`,
                validate: (cb, val) => {
                    const result = forms.email(val)

                    cb(result)
                },
                errorMessage: this.context.contactEmail,
            },
            {
                selector: `${formSelector} textarea[name="contact_question"]`,
                validate: (cb, val) => {
                    const result = forms.notEmpty(val)

                    cb(result)
                },
                errorMessage: this.context.contactQuestion,
            },
        ])

        $contactForm.addEventListener('submit', (event) => {
            contactUsValidator.performCheck()

            if (contactUsValidator.areAll('valid')) {
                return
            }

            event.preventDefault()
        })
    }
}
