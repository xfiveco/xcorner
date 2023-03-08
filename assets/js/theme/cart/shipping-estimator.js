import stateCountry from '../common/state-country';
import nod from '../common/nod';
import utils from '@bigcommerce/stencil-utils';
import { Validators, announceInputErrorMessage } from '../common/utils/form-utils';
import collapsibleFactory from '../common/collapsible';
import { showAlertModal } from '../global/modal';
import q$ from '../global/selector';

export default class ShippingEstimator {
    constructor($element, shippingErrorMessages) {
        this.$element = $element;

        this.$state = q$('[data-field-type="State"]', this.$element);
        this.isEstimatorFormOpened = false;
        this.shippingErrorMessages = shippingErrorMessages;
        this.initFormValidation();
        this.bindStateCountryChange();
        this.bindEstimatorEvents();
    }

    initFormValidation() {
        const shippingEstimatorAlert = q$('.js-shipping-quotes');

        this.shippingEstimator = 'form.js-shipping-estimator';
        this.shippingValidator = nod({
            submit: `${this.shippingEstimator} .js-shipping-estimate-submit`,
            tap: announceInputErrorMessage,
        });

        q$('.js-shipping-estimate-submit', this.$element).addEventListener('click', event => {
            // estimator error messages are being injected in html as a result
            // of user submit; clearing and adding role on submit provides
            // regular announcement of these error messages
            if (shippingEstimatorAlert.getAttribute('role')) {
                shippingEstimatorAlert.removeAttribute('role');
            }

            shippingEstimatorAlert.setAttribute('role', 'alert');
            // When switching between countries, the state/region is dynamic
            // Only perform a check for all fields when country has a value
            // Otherwise areAll('valid') will check country for validity
            if (q$(`${this.shippingEstimator} select[name="shipping-country"]`).value) {
                this.shippingValidator.performCheck();
            }

            if (this.shippingValidator.areAll('valid')) {
                return;
            }

            event.preventDefault();
        });

        this.bindValidation();
        this.bindStateValidation();
        this.bindUPSRates();
    }

    bindValidation() {
        this.shippingValidator.add([
            {
                selector: `${this.shippingEstimator} select[name="shipping-country"]`,
                validate: (cb, val) => {
                    const countryId = Number(val);
                    const result = countryId !== 0 && !Number.isNaN(countryId);

                    cb(result);
                },
                errorMessage: this.shippingErrorMessages.country,
            },
        ]);
    }

    bindStateValidation() {
        this.shippingValidator.add([
            {
                selector: `${this.shippingEstimator} select[name="shipping-state"]`,
                validate: (cb) => {
                    let result;

                    const $ele = q$(`${this.shippingEstimator} select[name="shipping-state"]`);

                    if ($ele) {
                        const eleVal = $ele.value;

                        result = eleVal && eleVal !== 'State/province';
                    }

                    cb(result);
                },
                errorMessage: this.shippingErrorMessages.province,
            },
        ]);
    }

    /**
     * Toggle between default shipping and ups shipping rates
     */
    bindUPSRates() {
        const UPSRateToggle = '.estimator-form-toggleUPSRate';

        /* eslint-disable no-unused-expressions */
        q$(UPSRateToggle)?.addEventListener('click', (event) => {
            const $estimatorFormUps = q$('.estimator-form--ups');
            const $estimatorFormDefault = q$('.estimator-form--default');

            event.preventDefault();

            /* eslint-disable no-unused-expressions */
            $estimatorFormUps?.classList.toggle('u-hidden-visually');
            $estimatorFormDefault?.classList.toggle('u-hidden-visually');
        });
    }

    bindStateCountryChange() {
        let $last;

        // Requests the states for a country with AJAX
        stateCountry(this.$state, this.context, { useIdForStates: true }, (err, $field) => {
            if (err) {
                showAlertModal(err);
                throw new Error(err);
            }

            if (this.shippingValidator.getStatus(this.$state) !== 'undefined') {
                this.shippingValidator.remove(this.$state);
            }

            if ($last) {
                this.shippingValidator.remove($last);
            }

            if ($field.tagName.toLowerCase() === 'select') {
                $last = $field;
                this.bindStateValidation();
            } else {
                $field.setAttribute('placeholder', 'State/province');
                Validators.cleanUpStateValidation($field);
            }

            // When you change a country, you swap the state/province between an input and a select dropdown
            // Not all countries require the province to be filled
            // We have to remove this class when we swap since nod validation doesn't cleanup for us
            q$(this.shippingEstimator)
                .querySelector('.js-form-field-success')
                .classList.remove('js-form-field-success');
        });
    }

    toggleEstimatorFormState($toggleButton, buttonSelector, $toggleContainer) {
        const changeAttributesOnToggle = (selectorToActivate) => {
            $toggleButton.setAttribute('aria-labelledby', selectorToActivate);
            q$(buttonSelector).textContent = $(`#${selectorToActivate}`).textContent;
        };

        if (!this.isEstimatorFormOpened) {
            changeAttributesOnToggle('estimator-close');
            $toggleContainer.classList.remove('u-hidden-visually');
        } else {
            changeAttributesOnToggle('estimator-add');
            $toggleContainer.classList.add('u-hidden-visually');
        }
        this.isEstimatorFormOpened = !this.isEstimatorFormOpened;
    }

    bindEstimatorEvents() {
        const $estimatorContainer = q$('.js-shipping-estimator');
        const $estimatorForm = q$('.js-estimator-form');

        collapsibleFactory();

        $estimatorForm.addEventListener('submit', event => {
            const params = {
                country_id: q$('[name="shipping-country"]', $estimatorForm).value,
                state_id: q$('[name="shipping-state"]', $estimatorForm).value,
                city: q$('[name="shipping-city"]', $estimatorForm).value,
                zip_code: q$('[name="shipping-zip"]', $estimatorForm).value,
            };

            event.preventDefault();

            utils.api.cart.getShippingQuotes(params, 'cart/shipping-quotes', (err, response) => {
                q$('.js-shipping-quotes').innerHTML = response.content;

                // bind the select button
                q$('.select-shipping-quote').addEventListener('click', clickEvent => {
                    const quoteId = q$('.shipping-quote:checked').value;

                    clickEvent.preventDefault();

                    utils.api.cart.submitShippingQuote(quoteId, () => {
                        window.location.reload();
                    });
                });
            });
        });

        q$('.js-shipping-estimate-show').addEventListener('click', event => {
            event.preventDefault();

            this.toggleEstimatorFormState(event.currentTarget, '.js-shipping-estimate-show-btn-name', $estimatorContainer);
        });
    }
}
