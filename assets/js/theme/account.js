import PageManager from './page-manager';
import _ from 'lodash';
import nod from './common/nod';
import Wishlist from './wishlist';
import validation from './common/form-validation';
import stateCountry from './common/state-country';
import {
    classifyForm,
    Validators,
    announceInputErrorMessage,
    insertStateHiddenField,
    createPasswordValidationErrorTextObject,
} from './common/utils/form-utils';
import { createTranslationDictionary } from './common/utils/translations-utils';
import { creditCardType, storeInstrument, Validators as CCValidators, Formatters as CCFormatters } from './common/payment-method';
import { showAlertModal } from './global/modal';
import compareProducts from './global/compare-products';
import q$, { prev, q$$ } from './global/selector';

export default class Account extends PageManager {
    constructor(context) {
        super(context);
        this.validationDictionary = createTranslationDictionary(context);
        this.$state = q$('[data-field-type="State"]');
        this.$body = q$('body');
    }

    onReady() {
        const $editAccountForm = classifyForm('form.js-edit-account-form');
        const $addressForm = classifyForm('form.js-address-form');
        const $inboxForm = classifyForm('form.js-inbox-form');
        const $accountReturnForm = classifyForm('.js-account-return-form');
        const $paymentMethodForm = classifyForm('form.js-payment-method-form');
        const $reorderForm = classifyForm('.js-account-reorder-form');
        const $invoiceButton = q$('[data-print-invoice]');
        const $bigCommerce = window.BigCommerce;

        compareProducts(this.context);

        // Injected via template
        this.passwordRequirements = this.context.passwordRequirements;

        // Instantiates wish list JS
        Wishlist.load(this.context);

        if ($editAccountForm) {
            this.registerEditAccountValidation($editAccountForm);
            if (this.$state?.tagName.toLowerCase() === 'input') {
                insertStateHiddenField(this.$state);
            }
        }

        if ($invoiceButton) {
            $invoiceButton.addEventListener('click', () => {
                const left = window.screen.availWidth / 2 - 450;
                const top = window.screen.availHeight / 2 - 320;
                const url = $invoiceButton.dataset.printInvoice;

                window.open(url, 'orderInvoice', `width=900,height=650,left=${left},top=${top},scrollbars=1`);
            });
        }

        if ($addressForm) {
            this.initAddressFormValidation($addressForm);

            if (this.$state.tagName.toLowerCase() === 'input') {
                insertStateHiddenField(this.$state);
            }
        }

        if ($inboxForm) {
            this.registerInboxValidation($inboxForm);
        }

        if ($accountReturnForm) {
            this.initAccountReturnFormValidation($accountReturnForm);
        }

        if ($paymentMethodForm) {
            this.initPaymentMethodFormValidation($paymentMethodForm);
        }

        if ($reorderForm) {
            this.initReorderForm($reorderForm);
        }

        if ($bigCommerce && $bigCommerce.accountPayments) {
            window.BigCommerce.accountPayments({
                widgetStyles: {
                    base: {
                        color: '#666666',
                        cursor: 'pointer',
                        display: 'block',
                        fontSize: '1rem',
                        lineHeight: '1.5',
                        marginBottom: '0.5rem',
                    },
                    error: {
                        color: 'red',
                    },
                    placeholder: {
                        color: '#d8d8d8',
                    },
                    validated: {
                        color: 'green',
                    },
                },
                countries: this.context.countries,
            });
        }

        this.bindDeleteAddress();
        this.bindDeletePaymentMethod();
    }

    /**
     * Binds a submit hook to ensure the customer receives a confirmation dialog before deleting an address
     */
    bindDeleteAddress() {
        /* eslint-disable no-unused-expressions */
        q$('[data-delete-address]')?.addEventListener('submit', event => {
            const message = event.currentTarget.dataset.deleteAddress;

            if (!window.confirm(message)) {
                event.preventDefault();
            }
        });
    }

    bindDeletePaymentMethod() {
        q$('[data-delete-payment-method]')?.addEventListener('submit', event => {
            const message = event.currentTarget.dataset.deletePaymentMethod;

            if (!window.confirm(message)) {
                event.preventDefault();
            }
        });
    }

    initReorderForm($reorderForm) {
        $reorderForm.addEventListener('submit', event => {
            const $productReorderCheckboxes = q$$('.account-listItem input[type="checkbox"]:checked');
            let submitForm = false;

            $reorderForm.querySelector('[name^="reorderitem"]').remove();

            $productReorderCheckboxes.forEach($productCheckbox => {
                const productId = $productCheckbox.value;
                const $input = document.createElement('input');
                $input.type = 'hidden';
                $input.name = `reorderitem[${productId}]`;
                $input.value = '1';

                submitForm = true;

                $reorderForm.append($input);
            });

            if (!submitForm) {
                event.preventDefault();
                showAlertModal(this.context.selectItem);
            }
        });
    }

    initAddressFormValidation($addressForm) {
        const validationModel = validation($addressForm, this.context);
        const stateSelector = 'form.js-address-form [data-field-type="State"]';
        const $stateElement = q$(stateSelector);
        const addressValidator = nod({
            submit: 'form.js-address-form [type="submit"]',
            tap: announceInputErrorMessage,
        });

        addressValidator.add(validationModel);

        if ($stateElement) {
            let $last;

            // Requests the states for a country with AJAX
            stateCountry($stateElement, this.context, (err, $field) => {
                if (err) {
                    throw new Error(err);
                }

                if (addressValidator.getStatus($stateElement) !== 'undefined') {
                    addressValidator.remove($stateElement);
                }

                if ($last) {
                    addressValidator.remove($last);
                }

                if ($field.tagName.toLowerCase() === 'select') {
                    $last = $field;
                    Validators.setStateCountryValidation(addressValidator, $field, this.validationDictionary.field_not_blank);
                } else {
                    Validators.cleanUpStateValidation($field);
                }
            });
        }

        $addressForm.addEventListener('submit', event => {
            addressValidator.performCheck();

            if (addressValidator.areAll('valid')) {
                return;
            }

            event.preventDefault();
        });
    }

    initAccountReturnFormValidation($accountReturnForm) {
        const errorMessage = $accountReturnForm.dataset.accountReturnFormError;

        $accountReturnForm.addEventListener('submit', event => {
            let formSubmit = false;

            // Iterate until we find a non-zero value in the dropdown for quantity
            q$$('[name^="return_qty"]', $accountReturnForm).forEach($ele => {
                if (parseInt($ele.value, 10) !== 0) {
                    formSubmit = true;

                    // Exit out of loop if we found at least one return
                    return true;
                }
            });

            if (formSubmit) {
                return true;
            }

            showAlertModal(errorMessage);

            return event.preventDefault();
        });
    }

    initPaymentMethodFormValidation($paymentMethodForm) {
        // Inject validations into form fields before validation runs
        /* eslint-disable no-param-reassign */
        $paymentMethodForm.querySelector('#first_name.js-form-field').dataset.validation = `{ "type": "singleline", "label": "${this.context.firstNameLabel}", "required": true, "maxlength": 0 }`;
        $paymentMethodForm.querySelector('#last_name.js-form-field').dataset.validation = `{ "type": "singleline", "label": "${this.context.lastNameLabel}", "required": true, "maxlength": 0 }`;
        $paymentMethodForm.querySelector('#company.js-form-field').dataset.validation = `{ "type": "singleline", "label": "${this.context.companyLabel}", "required": false, "maxlength": 0 }`;
        $paymentMethodForm.querySelector('#phone.js-form-field').dataset.validation = `{ "type": "singleline", "label": "${this.context.phoneLabel}", "required": false, "maxlength": 0 }`;
        $paymentMethodForm.querySelector('#address1.js-form-field').dataset.validation = `{ "type": "singleline", "label": "${this.context.address1Label}", "required": true, "maxlength": 0 }`;
        $paymentMethodForm.querySelector('#address2.js-form-field').dataset.validation = `{ "type": "singleline", "label": "${this.context.address2Label}", "required": false, "maxlength": 0 }`;
        $paymentMethodForm.querySelector('#city.js-form-field').dataset.validation = `{ "type": "singleline", "label": "${this.context.cityLabel}", "required": true, "maxlength": 0 }`;
        $paymentMethodForm.querySelector('#country.js-form-field').dataset.validation = `{ "type": "singleselect", "label": "${this.context.countryLabel}", "required": true, "prefix": "${this.context.chooseCountryLabel}" }`;
        $paymentMethodForm.querySelector('#state.js-form-field').dataset.validation = `{ "type": "singleline", "label": "${this.context.stateLabel}", "required": true, "maxlength": 0 }`;
        $paymentMethodForm.querySelector('#postal_code.js-form-field').dataset.validation = `{ "type": "singleline", "label": "${this.context.postalCodeLabel}", "required": true, "maxlength": 0 }`;

        const validationModel = validation($paymentMethodForm, this.context);
        const paymentMethodSelector = 'form.js-payment-method-form';
        const paymentMethodValidator = nod({
            submit: `${paymentMethodSelector} [type="submit"]`,
            tap: announceInputErrorMessage,
        });
        const $stateElement = q$(`${paymentMethodSelector} [data-field-type="State"]`);

        let $last;
        // Requests the states for a country with AJAX
        stateCountry($stateElement, this.context, (err, $field) => {
            if (err) {
                throw new Error(err);
            }

            if (paymentMethodValidator.getStatus($stateElement) !== 'undefined') {
                paymentMethodValidator.remove($stateElement);
            }

            if ($last) {
                paymentMethodValidator.remove($last);
            }

            if ($field.tagName.toLowerCase() === 'select') {
                $last = $field;
                Validators.setStateCountryValidation(paymentMethodValidator, $field, this.validationDictionary.field_not_blank);
            } else {
                Validators.cleanUpStateValidation($field);
            }
        });

        // Use credit card number input listener to highlight credit card type
        let cardType;
        q$(`${paymentMethodSelector} input[name="credit_card_number"]`).addEventListener('keyup', ({ target }) => {
            cardType = creditCardType(target.value);
            if (cardType) {
                q$(`${paymentMethodSelector} img[alt="${cardType}"]`).childNodes.forEach($child => {
                    $child.style.opacity = 0.2;
                });
            } else {
                q$(`${paymentMethodSelector} img`).style.opacity = 1;
            }
        });

        // Set of credit card validation
        CCValidators.setCreditCardNumberValidation(paymentMethodValidator, `${paymentMethodSelector} input[name="credit_card_number"]`, this.context.creditCardNumber);
        CCValidators.setExpirationValidation(paymentMethodValidator, `${paymentMethodSelector} input[name="expiration"]`, this.context.expiration);
        CCValidators.setNameOnCardValidation(paymentMethodValidator, `${paymentMethodSelector} input[name="name_on_card"]`, this.context.nameOnCard);
        CCValidators.setCvvValidation(paymentMethodValidator, `${paymentMethodSelector} input[name="cvv"]`, this.context.cvv, () => cardType);

        // Set of credit card format
        CCFormatters.setCreditCardNumberFormat(`${paymentMethodSelector} input[name="credit_card_number"]`);
        CCFormatters.setExpirationFormat(`${paymentMethodSelector} input[name="expiration"]`);

        // Billing address validation
        paymentMethodValidator.add(validationModel);

        $paymentMethodForm.addEventListener('submit', event => {
            event.preventDefault();

            // Perform final form validation
            paymentMethodValidator.performCheck();
            if (paymentMethodValidator.areAll('valid')) {
                // Serialize form data and reduce it to object
                const data = Object.fromEntries(new FormData($paymentMethodForm).entries());

                // Assign country and state code
                const country = _.find(this.context.countries, ({ value }) => value === data.country);
                const state = country && _.find(country.states, ({ value }) => value === data.state);
                data.country_code = country ? country.code : data.country;
                data.state_or_province_code = state ? state.code : data.state;

                // Default Instrument
                data.default_instrument = !!data.default_instrument;

                // Store credit card
                storeInstrument(this.context, data, () => {
                    window.location.href = this.context.paymentMethodsUrl;
                }, () => {
                    showAlertModal(this.context.generic_error);
                });
            }
        });
    }

    registerEditAccountValidation($editAccountForm) {
        const validationModel = validation($editAccountForm, this.context);
        const formEditSelector = 'form.js-edit-account-form';
        const editValidator = nod({
            submit: '${formEditSelector} [type="submit"]',
            delay: 900,
        });
        const emailSelector = `${formEditSelector} [data-field-type="EmailAddress"]`;
        const $emailElement = q$(emailSelector);
        const passwordSelector = `${formEditSelector} [data-field-type="Password"]`;
        const $passwordElement = q$(passwordSelector);
        const password2Selector = `${formEditSelector} [data-field-type="ConfirmPassword"]`;
        const $password2Element = q$(password2Selector);
        const currentPasswordSelector = `${formEditSelector} [data-field-type="CurrentPassword"]`;
        const $currentPassword = q$(currentPasswordSelector);

        // This only handles the custom fields, standard fields are added below
        editValidator.add(validationModel);

        if ($emailElement) {
            editValidator.remove(emailSelector);
            Validators.setEmailValidation(editValidator, emailSelector, this.validationDictionary.valid_email);
        }

        if ($passwordElement && $password2Element) {
            const { password: enterPassword, password_match: matchPassword } = this.validationDictionary;
            editValidator.remove(passwordSelector);
            editValidator.remove(password2Selector);
            Validators.setPasswordValidation(
                editValidator,
                passwordSelector,
                password2Selector,
                this.passwordRequirements,
                createPasswordValidationErrorTextObject(enterPassword, enterPassword, matchPassword, this.passwordRequirements.error),
                true,
            );
        }

        if ($currentPassword) {
            editValidator.add({
                selector: currentPasswordSelector,
                validate: (cb, val) => {
                    let result = true;

                    if (val === '' && $passwordElement.value !== '') {
                        result = false;
                    }

                    cb(result);
                },
                errorMessage: this.context.currentPassword,
            });
        }

        editValidator.add([
            {
                selector: `${formEditSelector} input[name='account_firstname']`,
                validate: (cb, val) => {
                    const result = val.length;

                    cb(result);
                },
                errorMessage: this.context.firstName,
            },
            {
                selector: `${formEditSelector} input[name='account_lastname']`,
                validate: (cb, val) => {
                    const result = val.length;

                    cb(result);
                },
                errorMessage: this.context.lastName,
            },
        ]);

        $editAccountForm.addEventListener('submit', event => {
            editValidator.performCheck();

            if (editValidator.areAll('valid')) {
                return;
            }

            event.preventDefault();
            setTimeout(() => {
                const earliestError = prev(q$('.js-inline-message'), 'input');
                earliestError?.focus();
            }, 900);
        });
    }

    registerInboxValidation($inboxForm) {
        const inboxValidator = nod({
            submit: 'form.js-inbox-form [type="submit"]',
            delay: 900,
        });

        inboxValidator.add([
            {
                selector: 'form.js-inbox-form select[name="message_order_id"]',
                validate: (cb, val) => {
                    const result = Number(val) !== 0;

                    cb(result);
                },
                errorMessage: this.context.enterOrderNum,
            },
            {
                selector: 'form.js-inbox-form input[name="message_subject"]',
                validate: (cb, val) => {
                    const result = val.length;

                    cb(result);
                },
                errorMessage: this.context.enterSubject,
            },
            {
                selector: 'form.js-inbox-form textarea[name="message_content"]',
                validate: (cb, val) => {
                    const result = val.length;

                    cb(result);
                },
                errorMessage: this.context.enterMessage,
            },
        ]);

        $inboxForm.on('submit', event => {
            inboxValidator.performCheck();

            if (inboxValidator.areAll('valid')) {
                return;
            }

            event.preventDefault();

            setTimeout(() => {
                const earliestError = prev(q$('.js-form-inline-message:first'), 'input');
                earliestError.focus();
            }, 900);
        });
    }
}
