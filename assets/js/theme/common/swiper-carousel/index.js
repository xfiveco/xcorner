// Import Swiper and modules
import Swiper, { Navigation } from 'swiper';
import 'swiper/scss';
import 'swiper/scss/navigation';

// Create a new Swiper instance
const swiper = new Swiper('.js-swiper', {
    // Install modules and set settings
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
});

// Initiliaze Swiper instance
export const initializeSwiperCarousel = () => {
    swiper.initialize();
};
