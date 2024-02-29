// Import Swiper and modules
import Swiper, { Navigation, Pagination, Grid } from 'swiper'

/* eslint-disable import/no-unresolved, import/extensions */
import 'swiper/scss'
import 'swiper/scss/navigation'
import 'swiper/css/pagination'
import 'swiper/css/grid'
/* eslint-enable import/no-unresolved, import/extensions */

const productCarouselParams = {
    direction: 'horizontal',
    modules: [Navigation, Pagination, Grid],
    allowSlideNext: true,
    allowSlidePrev: true,
    slidesPerView: 2,
    grid: {
        fill: 'row',
        rows: 2,
    },
    spaceBetween: 48,
    speed: 500,
    loop: false,
    autoplay: false,
    navigation: {
        nextEl: '.js-swiper-btn-next',
        prevEl: '.js-swiper-btn-prev',
    },
    pagination: {
        el: '.js-swiper-pagination',
        clickable: true,
    },
    breakpoints: {
        481: {
            slidesPerView: 2,
            grid: {
                fill: 'row',
                rows: 2,
            },
        },
        769: {
            slidesPerView: 3,
            grid: {
                fill: 'row',
                rows: 2,
            },
        },
        992: {
            slidesPerView: 4,
            grid: {
                fill: 'row',
                rows: 1,
            },
        },
    },
}

const carouselParams = {
    direction: 'horizontal',
    modules: [Navigation, Pagination],
    allowSlideNext: true,
    allowSlidePrev: true,
    slidesPerView: 1,
    speed: 500,
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

// Create a new Product Swiper instance
const productSwiper = new Swiper('.js-product-swiper', productCarouselParams)

// Create a new Carousel Swiper instance
const carouselSwiper = new Swiper('.js-swiper', carouselParams)

// Initiliaze Swiper instance
export const initializeProductSwiperCarousel = () => {
    productSwiper.initialize()
}

// Initiliaze Swiper instance
export const initializeCarouselSwiperCarousel = () => {
    carouselSwiper.initialize()
}
