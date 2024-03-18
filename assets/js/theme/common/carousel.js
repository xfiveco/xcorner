import Swiper, { Navigation, Pagination } from 'swiper'
import q$ from '../global/selector'

/* eslint-disable import/no-unresolved, import/extensions */
import 'swiper/scss'
import 'swiper/scss/navigation'
import 'swiper/css/pagination'
/* eslint-enable import/no-unresolved, import/extensions */

export default function startSwiper(context) {
    if (q$('.js-home-swiper') !== null) {
        const homeCarouselParams = {
            direction: 'horizontal',
            modules: [Navigation, Pagination],
            allowSlideNext: true,
            allowSlidePrev: true,
            slidesPerView: 1,
            speed: context.carousel?.swap_frequency ?? 500,
            loop: true,
            autoplay: {
                delay: 3000,
            },
            navigation: {
                nextEl: '.js-swiper-btn-next',
                prevEl: '.js-swiper-btn-prev',
            },
            pagination: {
                el: '.js-swiper-pagination',
                clickable: true,
            },
        }

        /* eslint-disable no-new */
        new Swiper('.js-home-swiper', homeCarouselParams)
    }

    const carouselParams = {
        direction: 'horizontal',
        modules: [Navigation, Pagination],
        allowSlideNext: true,
        allowSlidePrev: true,
        slidesPerView: 4,
        spaceBetween: 48,
        speed: 500,
        loop: false,
        autoplay: {
            delay: 3000,
        },
        navigation: {
            nextEl: '.js-swiper-btn-next',
            prevEl: '.js-swiper-btn-prev',
        },
        pagination: {
            el: '.js-swiper-pagination',
            clickable: true,
        },
    }

    const carouselParamsOverflow = {
        direction: 'horizontal',
        modules: [Navigation, Pagination],
        allowSlideNext: true,
        allowSlidePrev: true,
        slidesPerView: 1,
        speed: 500,
        loop: true,
        spaceBetween: 48,
        autoplay: {
            delay: 3000,
        },
        breakpoints: {
            480: {
                slidesPerView: 2,
                spaceBetween: 40,
            },
            768: {
                slidesPerView: 4,
                spaceBetween: 40,
            },
        },
        navigation: {
            nextEl: '.js-swiper-btn-next',
            prevEl: '.js-swiper-btn-prev',
        },
        pagination: {
            el: '.js-swiper-pagination',
            clickable: true,
        },
    }

    if (q$('.js-featured-swiper') !== null) {
        new Swiper('.js-featured-swiper', carouselParams)
    }

    if (q$('.js-new-swiper') !== null) {
        new Swiper('.js-new-swiper', carouselParams)
    }

    if (q$('.js-review-swiper') !== null) {
        new Swiper('.js-review-swiper', carouselParamsOverflow)
    }
}
