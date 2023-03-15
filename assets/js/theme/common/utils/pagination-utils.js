import q$ from '../../global/selector'

const changeWishlistPaginationLinks = (wishlistUrl, ...paginationItems) =>
    paginationItems.forEach(($item) => {
        const paginationLink = $item.querySelector('.js-pagination-link')

        if (paginationLink.href.includes('page=') === false) {
            const pageNumber = paginationLink.href
            paginationLink.href = `${wishlistUrl}page=${pageNumber}`
        }
    })

/**
 * helps to withdraw differences in structures around the stencil resource pagination
 */
export const wishlistPaginatorHelper = () => {
    const $paginationList = q$('.js-pagination-list')

    if ($paginationList === null) return

    const $nextItem = q$('.js-pagination-item-next', $paginationList)
    const $prevItem = q$('.js-pagination-item-previous', $paginationList)
    const currentHref = q$('.js-pagination-current-page-link').href
    const partialPaginationUrl = currentHref.split('page=').shift()

    changeWishlistPaginationLinks(partialPaginationUrl, $prevItem, $nextItem)
}
