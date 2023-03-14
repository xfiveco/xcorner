// Import Swiper and modules
import Swiper, { Navigation } from 'swiper';

/* eslint-disable import/no-unresolved, import/extensions */
import 'swiper/scss';
import 'swiper/scss/navigation';
/* eslint-enable import/no-unresolved, import/extensions */

const productCarouselParams = {
    direction: 'horizontal',
    modules: [Navigation],
    allowSlideNext: true,
    allowSlidePrev: true,
    slidesPerView: 3,
    speed: 500,
    loop: false,
    autoplay: false,
    navigation: {
        nextEl: '.js-swiper-btn-next',
        prevEl: '.js-swiper-btn-prev',
    },
    breakpoints: {
        481: {
            slidesPerView: 1,
        },
        769: {
            slidesPerView: 2,
        },
        992: {
            slidesPerView: 3,
        },
    },
};

const carouselParams = {
    direction: 'horizontal',
    modules: [Navigation],
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
};

// Create a new Product Swiper instance
const productSwiper = new Swiper('.js-product-swiper', productCarouselParams);

// Create a new Carousel Swiper instance
const carouselSwiper = new Swiper('.js-swiper', carouselParams);

// Initiliaze Swiper instance
export const initializeProductSwiperCarousel = () => {
    productSwiper.initialize();
};

// Initiliaze Swiper instance
export const initializeCarouselSwiperCarousel = () => {
    carouselSwiper.initialize();
};
