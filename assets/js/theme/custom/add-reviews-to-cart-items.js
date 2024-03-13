/**
 * Add reviews to cart items via GraphQL
 */
export default function addReviewsToCartItems(storefrontApiToken) {
    const cartItems = document.querySelectorAll('.js-item-row')
    if (cartItems.length > 0) {
        cartItems.forEach((product) => {
            const productId = product.getAttribute('data-type-product-id')
            fetch('/graphql', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${storefrontApiToken}`,
                },
                body: JSON.stringify({
                    query: `
                        query getProductRating {
                            site {
                                product(entityId: ${productId}) {
                                    reviewSummary {
                                        numberOfReviews
                                        summationOfRatings
                                    }
                                }
                            }
                        }
                    `,
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    const summationOfRatings = data?.data?.site?.product?.reviewSummary?.summationOfRatings
                    const numberOfReviews = data?.data?.site?.product?.reviewSummary?.numberOfReviews
                    const ratingElement = document.querySelector(`[data-type-product-id="${productId}"] .c-cart__item-rating`)
                    const ratingLink = document.querySelector(`[data-type-product-id="${productId}"] .c-cart__item-rating-link`)

                    ratingLink.innerHTML = `${numberOfReviews} reviews`

                    if (ratingElement) {
                        ratingElement.setAttribute('data-product-rating', summationOfRatings)
                        const filledStars = ratingElement.querySelectorAll('.c-cart-item__filled-stars svg')
                        const unfilledStars = ratingElement.querySelectorAll('.c-cart-item__unfilled-stars svg')

                        for (let i = 0; i < summationOfRatings; i++) {
                            filledStars[i].classList.remove('u-hidden')
                        }

                        for (let i = 0; i < 5 - summationOfRatings; i++) {
                            unfilledStars[i].classList.remove('u-hidden')
                        }
                    }
                })
        })
    }
}
