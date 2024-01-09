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
        modules: [Navigation],
        allowSlideNext: true,
        allowSlidePrev: true,
        slidesPerView: 3,
        speed: 500,
        loop: true,
        autoplay: {
            delay: 3000,
        },
        navigation: {
            nextEl: '.js-swiper-btn-next',
            prevEl: '.js-swiper-btn-prev',
        },
    }

    if (q$('.js-featured-swiper') !== null) {
        new Swiper('.js-featured-swiper', carouselParams)
    }

    if (q$('.js-top-swiper') !== null) {
        new Swiper('.js-top-swiper', carouselParams)
    }

    if (q$('.js-new-swiper') !== null) {
        new Swiper('.js-new-swiper', carouselParams)
    }
}
