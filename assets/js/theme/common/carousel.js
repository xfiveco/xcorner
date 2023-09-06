import Swiper, { Navigation, Pagination } from 'swiper'
import q$, { q$$ } from '../global/selector'

const selectors = {
    swipers: {
        home: '.js-home-swiper',
        featured: '.js-featured-swiper',
        top: '.js-top-swiper',
        new: '.js-new-swiper',
        products: '.js-products-swiper',
    },
    pagination: '.js-swiper-pagination',
    buttons: {
        next: '.js-swiper-btn-next',
        prev: '.js-swiper-btn-prev',
    },
}

function getButtonsParams(carouselElement) {
    if (!carouselElement) return {}

    const prevButton = q$(selectors.buttons.prev, carouselElement.parentElement)
    const nextButton = q$(selectors.buttons.next, carouselElement.parentElement)

    return {
        nextEl: nextButton,
        prevEl: prevButton,
    }
}

function getPaginationParams(carouselElement) {
    if (!carouselElement) return {}

    const paginationElement = q$(selectors.pagination, carouselElement.parentElement)

    return {
        el: paginationElement,
        type: 'bullets',
        clickable: true,
    }
}

/* eslint-disable import/no-unresolved, import/extensions */

/* eslint-enable import/no-unresolved, import/extensions */

export default function startSwiper(context) {
    const productsCarousels = q$$(selectors.swipers.products)
    const featuredCarousel = q$(selectors.swipers.featured)
    const topCarousel = q$(selectors.swipers.top)
    const newCarousel = q$(selectors.swipers.new)

    if (q$(selectors.swipers.home) !== null) {
        const homeCarouselParams = {
            direction: 'horizontal',
            modules: [Navigation],
            allowSlideNext: true,
            allowSlidePrev: true,
            slidesPerView: 1,
            speed: context.carousel?.swap_frequency ?? 500,
            loop: true,
            autoplay: {
                delay: 3000,
            },
            navigation: {
                nextEl: q$(`${selectors.swipers.home} ${selectors.buttons.next}`),
                prevEl: q$(`${selectors.swipers.home} ${selectors.buttons.prev}`),
            },
        }

        /* eslint-disable no-new */
        new Swiper(selectors.swipers.home, homeCarouselParams)
    }

    const defaultParams = {
        direction: 'horizontal',
        modules: [Navigation, Pagination],
        allowSlideNext: true,
        allowSlidePrev: true,
        slidesPerView: 1,
        speed: 500,
        lockClass: 'disabled',
        loop: false,
        breakpoints: {
            480: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            680: {
                slidesPerView: 3,
                spaceBetween: 30,
            },
            1024: {
                slidesPerView: 4,
                spaceBetween: 30,
            },
        },
        autoplay: {
            delay: 3000,
        },
        hashNavigation: {
            watchState: true,
        },
    }

    if (featuredCarousel !== null) {
        new Swiper(selectors.swipers.featured, Object.assign(defaultParams))
    }

    if (topCarousel !== null) {
        new Swiper(
            selectors.swipers.top,
            Object.assign(defaultParams, {
                navigation: { ...getButtonsParams(topCarousel) },
            }),
        )
    }

    if (newCarousel !== null) {
        new Swiper(
            selectors.swipers.new,
            Object.assign(defaultParams, {
                navigation: { ...getButtonsParams(newCarousel) },
            }),
        )
    }

    if (productsCarousels && productsCarousels.length) {
        productsCarousels.forEach((carousel) => {
            new Swiper(
                carousel,
                Object.assign(defaultParams, {
                    navigation: { ...getButtonsParams(carousel) },
                    pagination: { ...getPaginationParams(carousel) },
                }),
            )
        })
    }
}
