import PageManager from './page-manager';
import urlUtils from './common/utils/url-utils';
import q$ from './global/selector';

export default class CatalogPage extends PageManager {
    constructor(context) {
        super(context);

        window.addEventListener('beforeunload', () => {
            if (document.activeElement.id === 'sort') {
                window.localStorage.setItem('sortByStatus', 'selected');
            }
        });
    }

    arrangeFocusOnSortBy() {
        const $sortBySelector = q$('[js-sort-by="product"] #sort');

        if (window.localStorage.getItem('sortByStatus')) {
            $sortBySelector.focus();
            window.localStorage.removeItem('sortByStatus');
        }
    }

    onSortBySubmit(event, currentTarget) {
        const url = urlUtils.parse(window.location.href);
        const queryParams = new URLSearchParams(new FormData(currentTarget));
        const urlQuery = new URLSearchParams(url.searchParams);

        for (const [key, value] of queryParams) {
            urlQuery.set(key, value);
        }
        urlQuery.delete('page');

        urlUtils.goToUrl(new URL(`${ url.origin }${ url.pathname }?${ urlQuery }`));
    }
}
