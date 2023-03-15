import nod from '../common/nod'
import collapsibleFactory, { CollapsibleEvents } from '../common/collapsible'
import forms from '../common/models/forms'
import { safeString } from '../common/utils/safe-string'
import { announceInputErrorMessage } from '../common/utils/form-utils'
import q$, { parents } from '../global/selector'
import trigger from '../common/utils/trigger'

export default class {
    constructor({ $reviewForm, $context }) {
        if ($reviewForm) {
            this.validator = nod({
                submit: $reviewForm.querySelector('button[type="submit"]'),
                tap: announceInputErrorMessage,
            })
        }

        this.$context = $context
        this.$reviewTabLink = q$('.js-product-view-review-tab-link', this.$context)
        this.$reviewsContent = q$('#product-reviews', this.$context)
        this.$reviewsContentList = q$('#product-reviews-content', this.$reviewsContent)
        this.$collapsible = q$('.js-collapsible', this.$reviewsContent)

        if (this.$context) {
            collapsibleFactory('.js-collapsible', { $context })
        } else {
            this.initLinkBind()
        }

        this.injectPaginationLink()
        this.setupReviews()
    }

    /**
     * On initial page load, the user clicks on "(12 Reviews)" link
     * The browser jumps to the review page and should expand the reviews section
     */
    initLinkBind() {
        const $productReviewLink = q$('.js-product-review-link')

        $productReviewLink.href = `${$productReviewLink.href}${window.location.search}.#product-reviews`
        $productReviewLink.addEventListener('click', () => this.expandReviews())
    }

    setupReviews() {
        // We're in paginating state, reviews should be visible
        if (
            window.location.hash &&
            window.location.hash.indexOf('#product-reviews') === 0 &&
            parents('.js-quick-view', this.$reviewsContent).length === 0
        ) {
            this.expandReviews()
            return
        }

        // force collapse on page load
        trigger(this.$collapsible, CollapsibleEvents.click)
    }

    expandReviews() {
        this.$reviewTabLink.click()

        if (this.$reviewsContentList.classList.contains('is-open') === false) {
            trigger(this.$collapsible, CollapsibleEvents.click)
        }
    }

    /**
     * Inject ID into the pagination link
     */
    injectPaginationLink() {
        const $nextLink = q$('.js-pagination-item-next .js-pagination-link', this.$reviewsContent)
        const $prevLink = q$('.js-pagination-item-previous .js-pagination-link', this.$reviewsContent)

        if ($nextLink) {
            $nextLink.href = `${$nextLink.href} #product-reviews`
        }

        if ($prevLink) {
            $prevLink.href = `${$prevLink.href} #product-reviews`
        }
    }

    registerValidation(context) {
        this.context = context
        this.validator.add([
            {
                selector: '[name="revrating"]',
                validate: 'presence',
                errorMessage: safeString(this.context.reviewRating),
            },
            {
                selector: '[name="revtitle"]',
                validate: 'presence',
                errorMessage: safeString(this.context.reviewSubject),
            },
            {
                selector: '[name="revtext"]',
                validate: 'presence',
                errorMessage: safeString(this.context.reviewComment),
            },
            {
                selector: '.js-write-review-form [name="email"]',
                validate: (cb, val) => {
                    const result = forms.email(val)
                    cb(result)
                },
                errorMessage: this.context.reviewEmail,
            },
        ])

        return this.validator
    }

    validate() {
        return this.validator.performCheck()
    }
}
