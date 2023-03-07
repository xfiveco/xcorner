import PageManager from './page-manager';
import { bind, debounce } from 'lodash';
import checkIsGiftCertValid from './common/gift-certificate-validator';
import { createTranslationDictionary } from './common/utils/translations-utils';
import utils from '@bigcommerce/stencil-utils';
import ShippingEstimator from './cart/shipping-estimator';
import { defaultModal, showAlertModal, ModalEvents } from './global/modal';
import CartItemDetails from './common/cart-item-details';
import q$, { q$$ } from './global/selector';
import trigger from './common/utils/trigger';
import toggle from './global/toggle';

export default class Cart extends PageManager {
    onReady() {
        this.$modal = null;
        this.$cartPageContent = q$('.js-cart');
        this.$cartContent = q$('.js-cart-content');
        this.$cartMessages = q$('.js-cart-status');
        this.$cartTotals = q$('.js-cart-totals');
        this.$cartAdditionalCheckoutBtns = q$('.js-cart-additional-checkout-buttons');
        this.$overlay = q$('.js-cart .js-loading-overlay');
        this.$overlay.style.display = 'none'; // TODO: temporary until roper pulls in his cart components
        this.$activeCartItemId = null;
        this.$activeCartItemBtnAction = null;

        this.setApplePaySupport();
        this.bindEvents();
    }

    setApplePaySupport() {
        if (window.ApplePaySession) {
            this.$cartPageContent.classList.add('js-apple-pay-supported');
        }
    }

    cartUpdate($target) {
        const itemId = $target.dataset.cartItemid;
        this.$activeCartItemId = itemId;
        this.$activeCartItemBtnAction = $target.dataset.action;

        const $el = q$(`#qty-${itemId}`);
        const oldQty = parseInt($el.value, 10);
        const maxQty = parseInt($el.dataset.quantityMax, 10);
        const minQty = parseInt($el.dataset.quantityMin, 10);
        const minError = $el.dataset.quantityMinError;
        const maxError = $el.dataset.quantityMaxError;
        const newQty = $target.dataset.action === 'inc' ? oldQty + 1 : oldQty - 1;
        // Does not quality for min/max quantity
        if (newQty < minQty) {
            return showAlertModal(minError);
        } else if (maxQty > 0 && newQty > maxQty) {
            return showAlertModal(maxError);
        }

        this.$overlay.style.display = 'block';

        utils.api.cart.itemUpdate(itemId, newQty, (err, response) => {
            this.$overlay.style.display = 'block';

            if (response.data.status === 'succeed') {
                // if the quantity is changed "1" from "0", we have to remove the row.
                const remove = (newQty === 0);

                this.refreshContent(remove);
            } else {
                $el.value = oldQty;
                showAlertModal(response.data.errors.join('\n'));
            }
        });
    }

    cartUpdateQtyTextChange($target, preVal = null) {
        const itemId = $target.dataset.cartItemid;
        const $el = q$(`#qty-${itemId}`);
        const maxQty = parseInt($el.dataset.quantityMax, 10);
        const minQty = parseInt($el.dataset.quantityMin, 10);
        const oldQty = preVal !== null ? preVal : minQty;
        const minError = $el.dataset.quantityMinError;
        const maxError = $el.dataset.quantityMaxError;
        const newQty = parseInt(Number($el.value), 10);
        let invalidEntry;

        // Does not quality for min/max quantity
        if (!Number.isInteger(newQty)) {
            invalidEntry = $el.value;
            $el.value = oldQty;
            return showAlertModal(this.context.invalidEntryMessage.replace('[ENTRY]', invalidEntry));
        } else if (newQty < minQty) {
            $el.value = oldQty;
            return showAlertModal(minError);
        } else if (maxQty > 0 && newQty > maxQty) {
            $el.value = oldQty;
            return showAlertModal(maxError);
        }

        this.$overlay.style.display = 'block';
        utils.api.cart.itemUpdate(itemId, newQty, (err, response) => {
            this.$overlay.style.display = 'none';

            if (response.data.status === 'succeed') {
                // if the quantity is changed "1" from "0", we have to remove the row.
                const remove = (newQty === 0);

                this.refreshContent(remove);
            } else {
                $el.value = oldQty;

                return showAlertModal(response.data.errors.join('\n'));
            }
        });
    }

    cartRemoveItem(itemId) {
        this.$overlay.style.display = 'block';
        utils.api.cart.itemRemove(itemId, (err, response) => {
            if (response.data.status === 'succeed') {
                this.refreshContent(true);
            } else {
                this.$overlay.style.display = 'none';
                showAlertModal(response.data.errors.join('\n'));
            }
        });
    }

    cartEditOptions(itemId, productId) {
        const context = { productForChangeId: productId, ...this.context };
        const modal = defaultModal();

        if (this.$modal === null) {
            this.$modal = q$('#modal');
        }

        const options = {
            template: 'cart/modals/configure-product',
        };

        modal.open();
        /* eslint-disable no-unused-expressions */
        this.$modal.querySelector('.js-modal-content')?.classList.add('hide-content');

        utils.api.productAttributes.configureInCart(itemId, options, (err, response) => {
            modal.updateContent(response.content);
            const optionChangeHandler = () => {
                const $productOptionsContainer = q$('[data-product-attributes-wrapper]', this.$modal);
                const modalBodyReservedHeight = $productOptionsContainer?.getBoundingClientRect().height;

                if ($productOptionsContainer && modalBodyReservedHeight) {
                    $productOptionsContainer.style.height = modalBodyReservedHeight;
                }
            };

            if (this.$modal.classList.contains('open')) {
                optionChangeHandler();
            } else {
                this.$modal.addEventListener(ModalEvents.opened, optionChangeHandler, { once: true });
            }

            this.productDetails = new CartItemDetails(this.$modal, context);

            this.bindGiftWrappingForm();
        });

        utils.hooks.on('product-option-change', (event, currentTarget) => {
            const $form = currentTarget.querySelector('form');
            const $submit = q$('c-button', $form);
            const $messageBox = q$('.js-alert-message-box');

            utils.api.productAttributes.optionChange(productId, Object.fromEntries(new FormData($form)), (err, result) => {
                const data = result.data || {};

                if (err) {
                    showAlertModal(err);
                    return false;
                }

                if (data.purchasing_message) {
                    q$('.js-alert-box-message', $messageBox).textContent = data.purchasing_message;
                    $submit.disabled = true;
                    $messageBox.style.display = 'block';
                } else {
                    $submit.disabled = false;
                    $messageBox.style.display = 'none';
                }

                if (!data.purchasable || !data.instock) {
                    $submit.disabled = true;
                } else {
                    $submit.disabled = false;
                }
            });
        });
    }

    refreshContent(remove) {
        const $cartItemsRows = q$$('.js-item-row', this.$cartContent);
        const $cartPageTitle = q$('.js-cart-page-title');
        const options = {
            template: {
                content: 'cart/content',
                totals: 'cart/totals',
                pageTitle: 'cart/page-title',
                statusMessages: 'cart/status-messages',
                additionalCheckoutButtons: 'cart/additional-checkout-buttons',
            },
        };

        this.$overlay.style.display = 'block';

        // Remove last item from cart? Reload
        if (remove && $cartItemsRows.length === 1) {
            return window.location.reload();
        }

        utils.api.cart.getContent(options, (err, response) => {
            this.$cartContent.innerHTML = response.content;
            this.$cartTotals.innerHTML = response.totals;
            this.$cartMessages.innerHTML = response.statusMessages;
            this.$cartAdditionalCheckoutBtns.innerHTML = response.additionalCheckoutButtons;

            $cartPageTitle.replaceWith(response.pageTitle);
            this.bindEvents();
            this.$overlay.style.display = 'none';

            const quantity = q$('[data-cart-quantity]', this.$cartContent).dataset.cartQuantity || 0;

            trigger(q$('body'), 'cart-quantity-update', quantity);

            const $foundItem = q$$(`[data-cart-itemid='${this.$activeCartItemId}']`, this.$cartContent)
                .filter($cartItem => $cartItem.matches(`[data-action='${this.$activeCartItemBtnAction}']`));

            if ($foundItem.length > 0) {
                trigger($foundItem, 'focus');
            }
        });
    }

    bindCartEvents() {
        const debounceTimeout = 400;
        const cartUpdate = bind(debounce(this.cartUpdate, debounceTimeout), this);
        const cartUpdateQtyTextChange = bind(debounce(this.cartUpdateQtyTextChange, debounceTimeout), this);
        const cartRemoveItem = bind(debounce(this.cartRemoveItem, debounceTimeout), this);
        let preVal;

        // cart update
        q$('.js-cart-update', this.$cartContent).addEventListener('click', event => {
            const $target = event.currentTarget;

            event.preventDefault();

            // update cart quantity
            cartUpdate($target);
        });

        // cart qty manually updates
        q$$('.js-cart-item-qty-input', this.$cartContent).forEach($input => {
            $input.addEventListener('focus', function onQtyFocus() {
                preVal = this.value;
            });

            $input.addEventListener('change', event => {
                const $target = event.currentTarget;
                event.preventDefault();

                // update cart quantity
                cartUpdateQtyTextChange($target, preVal);
            });
        });

        q$$('.js-cart-remove', this.$cartContent).forEach($remove => {
            $remove.addEventListener('click', event => {
                const itemId = event.currentTarget.dataset.cartItemid;
                const string = event.currentTarget.dataset.confirmDelete;

                showAlertModal(string, {
                    icon: 'warning',
                    showCancelButton: true,
                    onConfirm: () => {
                        // remove item from cart
                        cartRemoveItem(itemId);
                    },
                });
                event.preventDefault();
            });
        });

        q$$('[data-item-edit]', this.$cartContent).forEach($edit => {
            $edit.addEventListener('click', event => {
                const itemId = event.currentTarget.dataset.itemEdit;
                const productId = event.currentTarget.dataset.productId;
                event.preventDefault();
                // edit item in cart
                this.cartEditOptions(itemId, productId);
            });
        });
    }

    bindPromoCodeEvents() {
        const $couponContainer = q$('.js-coupon-code');
        const $couponForm = q$('.js-coupon-form');
        const $codeInput = q$('[name="couponcode"]', $couponForm);

        q$('.js-coupon-code-add').addEventListener('click', event => {
            event.preventDefault();

            /* eslint-disable no-param-reassign */
            event.currentTarget.style.display = 'none';
            $couponContainer.style.display = 'block';
            q$('.js-coupon-code-cancel').style.display = 'block';
            trigger($codeInput, 'focus');
        });

        q$('.js-coupon-code-cancel').addEventListener('click', event => {
            event.preventDefault();

            $couponContainer.style.display = 'none';
            q$('.js-coupon-code-cancel').style.display = 'none';
            q$('.js-coupon-code-add').style.display = 'block';
        });

        $couponForm.addEventListener('submit', event => {
            const code = $codeInput.value;

            event.preventDefault();

            // Empty code
            if (!code) {
                return showAlertModal($codeInput.dataset.error);
            }

            utils.api.cart.applyCode(code, (err, response) => {
                if (response.dataset.status === 'success') {
                    this.refreshContent();
                } else {
                    showAlertModal(response.data.errors.join('\n'));
                }
            });
        });
    }

    bindGiftCertificateEvents() {
        const $certContainer = q$('.js-gift-certificate-code');
        const $certForm = q$('.js-cart-gift-certificate-form');
        const $certInput = q$('[name="certcode"]', $certForm);

        q$('.js-gift-certificate-add')?.addEventListener('click', event => {
            event.preventDefault();
            toggle(event.currentTarget);
            toggle($certContainer);
            toggle(q$('.js-gift-certificate-cancel'));
        });

        q$('.js-gift-certificate-cancel')?.addEventListener('click', event => {
            event.preventDefault();
            toggle($certContainer);
            toggle(q$('.js-gift-certificate-add'));
            toggle(q$('.js-gift-certificate-cancel'));
        });

        $certForm?.addEventListener('submit', event => {
            const code = $certInput.value;

            event.preventDefault();

            if (!checkIsGiftCertValid(code)) {
                const validationDictionary = createTranslationDictionary(this.context);
                return showAlertModal(validationDictionary.invalid_gift_certificate);
            }

            utils.api.cart.applyGiftCertificate(code, (err, resp) => {
                if (resp.data.status === 'success') {
                    this.refreshContent();
                } else {
                    showAlertModal(resp.data.errors.join('\n'));
                }
            });
        });
    }

    bindGiftWrappingEvents() {
        const modal = defaultModal();

        q$$('[data-item-giftwrap]').forEach($giftwrap => {
            $giftwrap.addEventListener('click', event => {
                const itemId = event.currentTarget.dataset.itemGiftwrap;
                const options = {
                    template: 'cart/modals/gift-wrapping-form',
                };

                event.preventDefault();

                modal.open();

                utils.api.cart.getItemGiftWrappingOptions(itemId, options, (err, response) => {
                    modal.updateContent(response.content);

                    this.bindGiftWrappingForm();
                });
            });
        });
    }

    bindGiftWrappingForm() {
        q$('.js-gift-wrapping-select').addEventListener('change', event => {
            const $select = event.currentTarget;
            const id = $select.value;
            const index = $select.dataset.index;

            if (!id) {
                return;
            }

            const allowMessage = $select.querySelector(`option[value=${id}]`).dataset.allowMessage;

            q$(`.giftWrapping-image-${index}`).style.display = 'none';
            q$(`#giftWrapping-image-${index}-${id}`).style.display = 'block';

            if (allowMessage) {
                q$(`#giftWrapping-message-${index}`).style.display = 'block';
            } else {
                q$(`#giftWrapping-message-${index}`).style.display = 'none';
            }
        });

        trigger(q$('.js-gift-wrapping-select'), 'change');

        function toggleViews() {
            const value = q$('input[name ="giftwraptype"]:checked').value;
            const $singleForm = q$('.js-gift-wrapping-single');
            const $multiForm = q$('.js-gift-wrapping-multiple');

            try {
                if (value === 'same') {
                    $singleForm.style.display = 'block';
                    $multiForm.style.display = 'none';
                } else {
                    $singleForm.style.display = 'none';
                    $multiForm.style.display = 'block';
                }
            } catch (error) { /* NOOP */ }
        }

        q$$('[name="giftwraptype"]').forEach($giftType => {
            $giftType.addEventListener('click', toggleViews);
        });

        toggleViews();
    }

    bindEvents() {
        this.bindCartEvents();
        this.bindPromoCodeEvents();
        this.bindGiftWrappingEvents();
        this.bindGiftCertificateEvents();

        // initiate shipping estimator module
        const shippingErrorMessages = {
            country: this.context.shippingCountryErrorMessage,
            province: this.context.shippingProvinceErrorMessage,
        };
        this.shippingEstimator = new ShippingEstimator(q$('.js-shipping-estimator'), shippingErrorMessages);
    }
}
