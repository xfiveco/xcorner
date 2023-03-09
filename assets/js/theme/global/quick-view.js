import utils from '@bigcommerce/stencil-utils';
import Review from '../product/reviews';
import ProductDetails from '../common/product-details';
import { defaultModal, ModalEvents } from './modal';
import { initializeProductSwiperCarousel, initializeCarouselSwiperCarousel } from '../common/swiper-carousel';
import q$, { q$$ } from './selector';

export default function (context) {
    const modal = defaultModal();

    /* eslint-disable no-unused-expressions */
    q$$('.js-quick-view').forEach($quickView => {
        $quickView.addEventListener('click', event => {
            event.preventDefault();

            const productId = event.currentTarget.dataset.productId;
            const handleDropdownExpand = ({ currentTarget }) => {
                const $dropdownMenu = currentTarget;
                const dropdownBtnHeight = $dropdownMenu.previousElementSibling.getBoundingClientRect().height;

                $dropdownMenu.style.top = dropdownBtnHeight;

                return modal.$modal.addEventListener(ModalEvents.close, () => $dropdownMenu.removeEventListener('opened.fndtn.dropdown', handleDropdownExpand), { once: true });
            };

            modal.open({ size: 'large' });

            utils.api.product.getById(productId, { template: 'products/quick-view' }, (err, response) => {
                if (err) return;

                modal.updateContent(response);

                q$('#modal .js-dropdown-menu').addEventListener('opened.fndtn.dropdown', handleDropdownExpand);
                modal.$content.querySelector('.js-product-view')?.classList.add('is-product-view-quick-view');

                const $productCarousel = modal.$content.querySelector('.js-product-swiper');
                const $carousel = modal.$content.querySelector('.js-swiper');

                if ($productCarousel !== null) {
                    initializeProductSwiperCarousel();
                }

                if ($carousel !== null) {
                    initializeCarouselSwiperCarousel();
                }


                /* eslint-disable no-new */
                new Review({ $context: modal.$content });

                return new ProductDetails(modal.$content.querySelector('.js-quick-view'), context);
            });
        });
    });
}
