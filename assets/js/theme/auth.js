import PageManager from './page-manager'
import stateCountry from './common/state-country'
import nod from './common/nod'
import validation from './common/form-validation'
import forms from './common/models/forms'
import { classifyForm, Validators, createPasswordValidationErrorTextObject, announceInputErrorMessage } from './common/utils/form-utils'
import { createTranslationDictionary } from './common/utils/translations-utils'
import q$ from './global/selector'

export default class Auth extends PageManager {
    constructor(context) {
        super(context)
        this.validationDictionary = createTranslationDictionary(context)
        this.formCreateSelector = '.js-create-account-form'
        this.recaptcha = q$('.g-recaptcha iframe[src]')
    }

    registerLoginValidation($loginForm) {
        const loginModel = forms

        this.loginValidator = nod({
            submit: '.js-login-form button[type="submit"]',
            tap: announceInputErrorMessage,
        })

        this.loginValidator.add([
            {
                selector: '.js-login-form input[name="login_email"]',
                validate: (cb, val) => {
                    const result = loginModel.email(val)

                    cb(result)
                },
                errorMessage: this.context.useValidEmail,
            },
            {
                selector: '.js-login-form input[name="login_pass"]',
                validate: (cb, val) => {
                    const result = loginModel.password(val)

                    cb(result)
                },
                errorMessage: this.context.enterPass,
            },
        ])

        $loginForm.addEventListener('submit', (event) => {
            this.loginValidator.performCheck()

            if (this.loginValidator.areAll('valid')) {
                return
            }

            event.preventDefault()
        })
    }

    registerForgotPasswordValidation($forgotPasswordForm) {
        this.forgotPasswordValidator = nod({
            submit: '.js-forgot-password-form button[type="submit"]',
            tap: announceInputErrorMessage,
        })

        this.forgotPasswordValidator.add([
            {
                selector: '.js-forgot-password-form input[name="email"]',
                validate: (cb, val) => {
                    const result = forms.email(val)

                    cb(result)
                },
                errorMessage: this.context.useValidEmail,
            },
        ])

        $forgotPasswordForm.addEventListener('submit', (event) => {
            this.forgotPasswordValidator.performCheck()

            if (this.forgotPasswordValidator.areAll('valid')) {
                return
            }

            event.preventDefault()
        })
    }

    registerNewPasswordValidation() {
        const { password: enterPassword, password_match: matchPassword } = this.validationDictionary
        const newPasswordForm = '.js-new-password-form'
        const newPasswordValidator = nod({
            submit: q$(`${newPasswordForm} button[type="submit"]`),
            tap: announceInputErrorMessage,
        })
        const passwordSelector = q$(`${newPasswordForm} input[name="password"]`)
        const password2Selector = q$(`${newPasswordForm} input[name="password_confirm"]`)
        const errorTextMessages = createPasswordValidationErrorTextObject(
            enterPassword,
            enterPassword,
            matchPassword,
            this.passwordRequirements.error,
        )
        Validators.setPasswordValidation(newPasswordValidator, passwordSelector, password2Selector, this.passwordRequirements, errorTextMessages)
    }

    registerCreateAccountValidator($createAccountForm) {
        const validationModel = validation($createAccountForm, this.context)
        const createAccountValidator = nod({
            submit: `${this.formCreateSelector} button[type='submit']`,
            delay: 900,
        })
        const $stateElement = q$('[data-field-type="State"]')
        const emailSelector = `${this.formCreateSelector} [data-field-type='EmailAddress']`
        const $emailElement = q$(emailSelector)
        const passwordSelector = `${this.formCreateSelector} [data-field-type='Password']`
        const $passwordElement = q$(passwordSelector)
        const password2Selector = `${this.formCreateSelector} [data-field-type='ConfirmPassword']`
        const $password2Element = q$(password2Selector)

        createAccountValidator.add(validationModel)

        if ($stateElement) {
            let $last

            // Requests the states for a country with AJAX
            stateCountry($stateElement, this.context, (err, field) => {
                if (err) {
                    throw new Error(err)
                }

                if (createAccountValidator.getStatus($stateElement) !== 'undefined') {
                    createAccountValidator.remove($stateElement)
                }

                if ($last) {
                    createAccountValidator.remove($last)
                }

                if (field.tagName.toLowerCase() === 'select') {
                    $last = field
                    Validators.setStateCountryValidation(createAccountValidator, field, this.validationDictionary.field_not_blank)
                } else {
                    Validators.cleanUpStateValidation(field)
                }
            })
        }

        if ($emailElement) {
            createAccountValidator.remove(emailSelector)
            Validators.setEmailValidation(createAccountValidator, emailSelector, this.validationDictionary.valid_email)
        }

        if ($passwordElement && $password2Element) {
            const { password: enterPassword, password_match: matchPassword } = this.validationDictionary

            createAccountValidator.remove(passwordSelector)
            createAccountValidator.remove(password2Selector)
            Validators.setPasswordValidation(
                createAccountValidator,
                passwordSelector,
                password2Selector,
                this.passwordRequirements,
                createPasswordValidationErrorTextObject(enterPassword, enterPassword, matchPassword, this.passwordRequirements.error),
            )
        }

        $createAccountForm.addEventListener('submit', (event) => {
            this.submitAction(event, createAccountValidator)
        })
    }

    submitAction(event, validator) {
        validator.performCheck()

        if (validator.areAll('valid')) {
            return
        }
        event.preventDefault()

        setTimeout(() => {
            let $current = q$('.js-form-inline-message:first').previousElementSibling

            while (!!$current && $current.tagName.toLowerCase() !== 'input') {
                $current = $current.previousElementSibling
            }
            /* eslint-disable no-unused-expressions */
            $current?.focus()
        }, 900)
    }

    /**
     * Request is made in this function to the remote endpoint and pulls back the states for country.
     */
    onReady() {
        const $createAccountForm = classifyForm(this.formCreateSelector)
        const $loginForm = classifyForm('.js-login-form')
        const $forgotPasswordForm = classifyForm('.js-forgot-password-form')
        const $newPasswordForm = classifyForm('.js-new-password-form') // reset password

        // Injected via auth.html
        this.passwordRequirements = this.context.passwordRequirements

        if ($loginForm) {
            this.registerLoginValidation($loginForm)
        }

        if ($newPasswordForm) {
            this.registerNewPasswordValidation()
        }

        if ($forgotPasswordForm) {
            this.registerForgotPasswordValidation($forgotPasswordForm)
        }

        if ($createAccountForm) {
            this.registerCreateAccountValidator($createAccountForm)
        }

        setTimeout(() => {
            if (this.recaptcha === null) {
                this.recaptcha = q$('.g-recaptcha iframe[src]')
            }

            if (!this.recaptcha?.getAttribute('title')) {
                this.recaptcha?.setAttribute('title', this.context.recaptchaTitle)
            }
        }, 500)
    }
}
