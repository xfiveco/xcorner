import nod from './common/nod';
import PageManager from './page-manager';
import { wishlistPaginatorHelper } from './common/utils/pagination-utils';
import { announceInputErrorMessage } from './common/utils/form-utils';
import q$, { q$$ } from './global/selector';

export default class WishList extends PageManager {
    constructor(context) {
        super(context);

        this.options = {
            template: 'account/add-wishlist',
        };

        return this;
    }

    /**
     * Creates a confirm box before deleting all wish lists
     */
    wishlistDeleteConfirm() {
        q$$('.js-wishlist-delete').forEach($delete => {
            $delete.addEventListener('click', event => {
                const confirmed = window.confirm(this.context.wishlistDelete);

                if (confirmed) {
                    return true;
                }

                event.preventDefault();
            });
        });
    }

    registerAddWishListValidation($addWishlistForm) {
        this.addWishlistValidator = nod({
            submit: '.js-wishlist-form button[type="submit"]',
            tap: announceInputErrorMessage,
        });

        this.addWishlistValidator.add([
            {
                selector: '.js-wishlist-form input[name="wishlistname"]',
                validate: (cb, val) => {
                    const result = val.length > 0;

                    cb(result);
                },
                errorMessage: this.context.enterWishlistNameError,
            },
        ]);

        $addWishlistForm.addEventListener('submit', event => {
            this.addWishlistValidator.performCheck();

            if (this.addWishlistValidator.areAll('valid')) {
                return;
            }

            event.preventDefault();
        });
    }

    onReady() {
        const $addWishListForm = q$('.wishlist-form');

        if (q$('.js-pagination-wishlist')) {
            wishlistPaginatorHelper();
        }

        if ($addWishListForm) {
            this.registerAddWishListValidation($addWishListForm);
        }

        this.wishlistDeleteConfirm();
    }
}
