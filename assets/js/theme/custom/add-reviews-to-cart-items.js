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

                    const filledStarSVG = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M6 0L7.66869 4.21848L12 4.58359L8.7 7.55587L9.7082 12L6 9.61848L2.2918 12L3.3 7.55587L0 4.58359L4.33131 4.21848L6 0Z" fill="#C1A45A"></path>
                        </svg>`

                    const unfilledStarSVG = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M6 1.35931L7.20375 4.4024L7.31778 4.69068L7.62669 4.71672L10.8074 4.98484L8.36538 7.18435L8.14752 7.38056L8.21239 7.66649L8.95026 10.919L6.27019 9.19777L6 9.02425L5.72981 9.19777L3.04974 10.919L3.78761 7.66649L3.85247 7.38056L3.63462 7.18435L1.19259 4.98484L4.37331 4.71672L4.68222 4.69068L4.79625 4.4024L6 1.35931Z" stroke="#C1A45A"></path>
                        </svg>`

                    if (ratingElement) {
                        for (let i = 1; i <= 5; i++) {
                            if (i <= summationOfRatings) {
                                ratingElement.insertAdjacentHTML('beforeend', filledStarSVG)
                            } else {
                                ratingElement.insertAdjacentHTML('beforeend', unfilledStarSVG)
                            }
                        }
                    }
                })
        })
    }
}
