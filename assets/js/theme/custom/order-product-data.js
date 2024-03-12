/* @TODO: Need to figure out a way to hide API TOKEN on the front. */
export default function getOrderProductData(apiToken) {
    const selectors = {
        item: '.js-card-order',
        url: '.js-dynamic-url',
        wishlist: '.js-wishlist-add',
    }

    const items = Array.from(document.querySelectorAll(selectors.item))
    items.forEach((item) => {
        const links = Array.from(item.querySelectorAll(selectors.url))
        const sku = item.getAttribute('data-sku')
        const wishlistForm = item.querySelector(selectors.wishlist)

        fetch('/graphql', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiToken}`,
            },
            body: JSON.stringify({
                query: `
                        query myQuery {
                            site {
                                product(sku: "${sku}") {
                                    path
                                    entityId
                                }
                            }
                        }
                    `,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (!data || !data.data?.site?.product) {
                    return
                }
                const { product } = data.data.site
                const path = product.path
                if (path) {
                    links.forEach((link) => {
                        /* eslint-disable-next-line no-param-reassign */
                        link.href = path
                    })
                }

                const entityId = product.entityId
                if (wishlistForm && entityId) {
                    wishlistForm.action = `/wishlist.php?action=add&product_id=${entityId}`
                }
            })
    })
}
