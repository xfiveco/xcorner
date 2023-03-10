/*
 Import all product specific js
 */
import PageManager from './page-manager';
import Review from './product/reviews';
import collapsibleFactory from './common/collapsible';
import ProductDetails from './common/product-details';
import videoGallery from './product/video-gallery';
import { classifyForm } from './common/utils/form-utils';
import modalFactory from './global/modal';
import q$, { q$$ } from './global/selector';
import trigger from './common/utils/trigger';

export default class Product extends PageManager {
    constructor(context) {
        super(context);
        this.url = window.location.href;
        this.$reviewLink = q$('[data-reveal-id="modal-review-form"]');
        this.$bulkPricingLink = q$('[data-reveal-id="modal-bulk-pricing"]');
        this.reviewModal = modalFactory('#modal-review-form');
    }

    onReady() {
        // Listen for foundation modal close events to sanitize URL after review.
        document.addEventListener('close.fndtn.reveal', () => {
            if (this.url.indexOf('#write_review') !== -1 && typeof window.history.replaceState === 'function') {
                window.history.replaceState(null, document.title, window.location.pathname);
            }
        });

        let validator;

        // Init collapsible
        collapsibleFactory();

        this.productDetails = new ProductDetails(q$('.js-product-view'), this.context, window.BCData.product_attributes);
        this.productDetails.setProductVariant();

        videoGallery();

        this.bulkPricingHandler();

        const $reviewForm = classifyForm('.js-write-review-form');

        if ($reviewForm === null) return;

        const review = new Review({ $reviewForm });

        q$('[data-reveal-id="modal-review-form"]').addEventListener('click', () => {
            validator = review.registerValidation(this.context);
            this.ariaDescribeReviewInputs($reviewForm);
        });

        $reviewForm.addEventListener('submit', () => {
            if (validator) {
                validator.performCheck();
                return validator.areAll('valid');
            }

            return false;
        });

        this.productReviewHandler();
    }

    ariaDescribeReviewInputs($form) {
        q$$('.js-input', $form).forEach($input => {
            const msgSpanId = `${$input.getAttribute('name')}-msg`;

            Array.from($input.parentNode.children)
                .filter($sibling => $sibling.tagName.toLowerCase() === 'span')
                .forEach($sibling => {
                    /* eslint-disable no-param-reassign */
                    $sibling.id = msgSpanId;
                });

            $input.setAttribute('aria-describedby', msgSpanId);
        });
    }

    productReviewHandler() {
        if (this.url.indexOf('#write_review') !== -1) {
            trigger(this.$reviewLink, 'click');
        }
    }

    bulkPricingHandler() {
        if (this.url.indexOf('#bulk_pricing') !== -1) {
            trigger(this.$bulkPricingLink, 'click');
        }
    }
}
