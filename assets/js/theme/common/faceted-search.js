import { hooks, api } from '@bigcommerce/stencil-utils';
import _ from 'lodash';
import urlUtils from './utils/url-utils';
import modalFactory from '../global/modal';
import collapsibleFactory from './collapsible';
import { Validators } from './utils/form-utils';
import nod from './nod';
import q$, { q$$ } from '../global/selector';
import isVisible from './utils/is-visible';
import trigger from './utils/trigger';


const defaultOptions = {
    accordionToggleSelector:
        '.js-facets-search-wrapper .js-accordion-navigation, .js-facets-search-wrapper .js-facets-search-toggle',
    blockerSelector: '.js-facets-search-wrapper .js-blocker',
    clearFacetSelector: '.js-facets-search-wrapper .js-facets-search-clear',
    componentSelector: '.js-facets-search-nav-list',
    facetNavListSelector: '.js-facets-search-wrapper .js-facets-search-nav-list',
    priceRangeErrorSelector: '.js-facets-search-range-form .js-inline-message',
    priceRangeFieldsetSelector: '.js-facets-search-range-form .form-fieldset',
    priceRangeFormSelector: '.js-facets-search-range-form',
    priceRangeMaxPriceSelector: '.js-facets-search-range-form [name=max_price]',
    priceRangeMinPriceSelector: '.js-facets-search-range-form [name=min_price]',
    showMoreToggleSelector: '.js-facets-search-wrapper .accordion-content .toggleLink',
    facetedSearchFilterItems: '.js-facets-search-wrapper-filterItems .form-input',
    modal: modalFactory('.js-modal')[0],
    modalOpen: false,
};

/**
 * Faceted search view component
 */
class FacetedSearch {
    /**
     * @param {object} requestOptions - Object with options for the ajax requests
     * @param {function} callback - Function to execute after fetching templates
     * @param {object} options - Configurable options
     * @example
     *
     * let requestOptions = {
     *      templates: {
     *          productListing: 'category/product-listing',
     *          sidebar: 'category/sidebar'
     *     }
     * };
     *
     * let templatesDidLoad = function(content) {
     *     $productListingContainer.html(content.productListing);
     *     $facetedSearchContainer.html(content.sidebar);
     * };
     *
     * let facetedSearch = new FacetedSearch(requestOptions, templatesDidLoad);
     */
    constructor(requestOptions, callback, options) {
        // Private properties
        this.requestOptions = requestOptions;
        this.callback = callback;
        this.options = _.extend({}, defaultOptions, options);
        this.collapsedFacets = [];
        this.collapsedFacetItems = [];

        // Init collapsibles
        collapsibleFactory();

        // Init price validator
        this.initPriceValidator();

        // Show limited items by default
        q$$(this.options.facetNavListSelector).forEach($navList => {
            this.collapseFacetItems($navList);
        });

        // Mark initially collapsed accordions
        this.options.accordionToggleSelector.split(', ')
            .forEach(accordionSelector => {
                q$$(accordionSelector).forEach($accordionToggle => {
                    const collapsible = $accordionToggle.data?.collapsibleInstance;

                    if (collapsible?.isCollapsed) {
                        this.collapsedFacets.push(collapsible.targetId);
                    }
                });
            });

        // Collapse all facets if initially hidden
        // NOTE: Need to execute after Collapsible gets bootstrapped
        setTimeout(() => {
            if (isVisible(q$(this.options.componentSelector)) === false) {
                this.collapseAllFacets();
            }
        });

        // Observe user events
        this.onStateChange = this.onStateChange.bind(this);
        this.onToggleClick = this.onToggleClick.bind(this);
        this.onAccordionToggle = this.onAccordionToggle.bind(this);
        this.onClearFacet = this.onClearFacet.bind(this);
        this.onFacetClick = this.onFacetClick.bind(this);
        this.onRangeSubmit = this.onRangeSubmit.bind(this);
        this.onSortBySubmit = this.onSortBySubmit.bind(this);
        this.filterFacetItems = this.filterFacetItems.bind(this);

        this.bindEvents();
    }

    // Public methods
    refreshView(content) {
        if (content) {
            this.callback(content);
        }

        // Init collapsibles
        collapsibleFactory();

        // Init price validator
        this.initPriceValidator();

        // Restore view state
        this.restoreCollapsedFacets();
        this.restoreCollapsedFacetItems();

        // Bind events
        this.bindEvents();
    }

    updateView() {
        q$(this.options.blockerSelector).style.display = 'block';

        api.getPage(urlUtils.getUrl(), this.requestOptions, (err, content) => {
            q$(this.options.blockerSelector).style.display = 'none';

            if (err) {
                throw new Error(err);
            }

            // Refresh view with new content
            this.refreshView(content);
        });
    }

    expandFacetItems($navList) {
        const id = $navList.id;

        // Remove
        this.collapsedFacetItems = _.without(this.collapsedFacetItems, id);
    }

    collapseFacetItems($navList) {
        const id = $navList.id;
        const hasMoreResults = $navList.dataset.hasMoreResults;

        if (hasMoreResults) {
            this.collapsedFacetItems = _.union(this.collapsedFacetItems, [id]);
        } else {
            this.collapsedFacetItems = _.without(this.collapsedFacetItems, id);
        }
    }

    toggleFacetItems($navList) {
        const id = $navList.id;

        // Toggle depending on `collapsed` flag
        if (this.collapsedFacetItems.includes(id)) {
            this.getMoreFacetResults($navList);

            return true;
        }

        this.collapseFacetItems($navList);

        return false;
    }

    getMoreFacetResults($navList) {
        const facet = $navList.dataset.facet;
        const facetUrl = urlUtils.getUrl();

        if (this.requestOptions.showMore) {
            api.getPage(facetUrl, {
                template: this.requestOptions.showMore,
                params: {
                    list_all: facet,
                },
            }, (err, response) => {
                if (err) {
                    throw new Error(err);
                }

                this.options.modal.open();
                this.options.modalOpen = true;
                this.options.modal.updateContent(response);
            });
        }

        this.collapseFacetItems($navList);

        return false;
    }

    filterFacetItems(event) {
        const $items = q$$('.js-nav-list-item');
        const query = event.currentTarget.value.toLowerCase();

        $items.forEach($element => {
            const text = $element.textContent.toLowerCase();

            if (text.indexOf(query) !== -1) {
                /* eslint-disable no-param-reassign */
                $element.style.display = 'block';
            } else {
                $element.style.display = 'none';
            }
        });
    }

    expandFacet($accordionToggle) {
        const collapsible = $accordionToggle.data?.collapsibleInstance;

        /* eslint-disable no-unused-expressions */
        collapsible?.open();
    }

    collapseFacet($accordionToggle) {
        const collapsible = $accordionToggle.data?.collapsibleInstance;

        collapsible.close();
    }

    collapseAllFacets() {
        this.options.accordionToggleSelector.split(', ')
            .forEach(accordionSelector => {
                q$$(accordionSelector).forEach($accordionToggle => {
                    this.collapseFacet($accordionToggle);
                });
            });
    }

    expandAllFacets() {
        this.options.accordionToggleSelector.split(', ')
            .forEach(accordionSelector => {
                q$$(accordionSelector).forEach($accordionToggle => {
                    this.expandFacet($accordionToggle);
                });
            });
    }

    // Private methods
    initPriceValidator() {
        if (q$$(this.options.priceRangeFormSelector).length === 0) {
            return;
        }

        const validator = nod();
        const selectors = {
            errorSelector: this.options.priceRangeErrorSelector,
            fieldsetSelector: this.options.priceRangeFieldsetSelector,
            formSelector: this.options.priceRangeFormSelector,
            maxPriceSelector: this.options.priceRangeMaxPriceSelector,
            minPriceSelector: this.options.priceRangeMinPriceSelector,
        };

        Validators.setMinMaxPriceValidation(validator, selectors, this.options.validationErrorMessages);

        this.priceRangeValidator = validator;
    }

    restoreCollapsedFacetItems() {
        const $navLists = q$$(this.options.facetNavListSelector);

        // Restore collapsed state for each facet
        $navLists.forEach($navList => {
            const id = $navList.id;
            const shouldCollapse = this.collapsedFacetItems.includes(id);

            if (shouldCollapse) {
                this.collapseFacetItems($navList);
            } else {
                this.expandFacetItems($navList);
            }
        });
    }

    restoreCollapsedFacets() {
        this.options.accordionToggleSelector.split(', ')
            .forEach(accordionSelector => {
                q$$(accordionSelector).forEach($accordionToggle => {
                    const collapsible = $accordionToggle.data?.collapsibleInstance;
                    const id = collapsible.targetId;
                    const shouldCollapse = this.collapsedFacets.includes(id);

                    if (shouldCollapse) {
                        this.collapseFacet($accordionToggle);
                    } else {
                        this.expandFacet($accordionToggle);
                    }
                });
            });
    }

    bindEvents() {
        // Clean-up
        this.unbindEvents();

        // DOM events
        window.addEventListener('statechange', this.onStateChange);
        window.addEventListener('popstate', this.onPopState);

        q$$(this.options.showMoreToggleSelector).forEach($toggle => {
            $toggle.addEventListener('click', this.onToggleClick);
        });

        this.options.accordionToggleSelector.split(', ')
            .forEach(accordionSelector => {
                q$$(accordionSelector).forEach($accordionToggle => {
                    $accordionToggle.addEventListener('toggle.collapsible', this.onAccordionToggle);
                });
            });

        q$$(this.options.facetedSearchFilterItems).forEach($item => {
            $item.addEventListener('keyup', this.filterFacetItems);
        });

        q$$(this.options.clearFacetSelector).forEach($clear => {
            $clear.addEventListener('click', this.onClearFacet);
        });

        // Hooks
        hooks.on('facetedSearch-facet-clicked', this.onFacetClick);
        hooks.on('facetedSearch-range-submitted', this.onRangeSubmit);
        hooks.on('sortBy-submitted', this.onSortBySubmit);
    }

    unbindEvents() {
        // DOM events
        window.removeEventListener('statechange', this.onStateChange);
        window.removeEventListener('popstate', this.onPopState);

        q$$(this.options.showMoreToggleSelector).forEach($toggle => {
            $toggle.removeEventListener('click', this.onToggleClick);
        });


        this.options.accordionToggleSelector.split(', ')
            .forEach(accordionSelector => {
                q$$(accordionSelector).forEach($accordionToggle => {
                    $accordionToggle.removeEventListener('toggle.collapsible', this.onAccordionToggle);
                });
            });

        q$$(this.options.facetedSearchFilterItems).forEach($item => {
            $item.removeEventListener('keyup', this.filterFacetItems);
        });

        q$$(this.options.clearFacetSelector).forEach($clear => {
            $clear.removeEventListener('click', this.onClearFacet);
        });

        // Hooks
        hooks.off('facetedSearch-facet-clicked', this.onFacetClick);
        hooks.off('facetedSearch-range-submitted', this.onRangeSubmit);
        hooks.off('sortBy-submitted', this.onSortBySubmit);
    }

    onClearFacet(event) {
        const $link = event.currentTarget;
        const url = $link.href;

        event.preventDefault();
        event.stopPropagation();

        // Update URL
        urlUtils.goToUrl(url);
    }

    onToggleClick(event) {
        const $toggle = event.currentTarget;
        const $navList = q$($toggle.href);

        // Prevent default
        event.preventDefault();

        // Toggle visible items
        this.toggleFacetItems($navList);
    }

    onFacetClick(event, currentTarget) {
        const $link = currentTarget;
        const url = $link.href;

        event.preventDefault();

        $link.classList.toggle('is-selected');

        // Update URL
        urlUtils.goToUrl(url);

        if (this.options.modalOpen) {
            this.options.modal.close();
        }
    }

    onSortBySubmit(event, currentTarget) {
        event.preventDefault();

        const url = urlUtils.parse(window.location.href);
        const queryParams = new URLSearchParams(new FormData(currentTarget));
        const urlQuery = new URLSearchParams(url.searchParams);

        for (const [key, value] of queryParams) {
            urlQuery.set(key, value);
        }

        urlUtils.goToUrl(new URL(`${ url.origin }${ url.pathname }?${ urlQuery }`));
    }

    onRangeSubmit(event, currentTarget) {
        event.preventDefault();

        if (!this.priceRangeValidator.areAll(nod.constants.VALID)) {
            return;
        }

        const url = urlUtils.parse(window.location.href);
        const queryParams = new URLSearchParams(new FormData(currentTarget));
        const urlQuery = new URLSearchParams(url.searchParams);

        for (const [key, value] of queryParams) {
            urlQuery.set(key, value);
        }

        urlUtils.goToUrl(new URL(`${ url.origin }${ url.pathname }?${ urlQuery }`));
    }

    onStateChange() {
        this.updateView();
    }

    onAccordionToggle(event) {
        const $accordionToggle = event.currentTarget;
        const collapsible = $accordionToggle.data.collapsibleInstance;
        const id = collapsible.targetId;

        if (collapsible.isCollapsed) {
            this.collapsedFacets = _.union(this.collapsedFacets, [id]);
        } else {
            this.collapsedFacets = _.without(this.collapsedFacets, id);
        }
    }

    onPopState() {
        const currentUrl = window.location.href;
        const searchParams = new URLSearchParams(currentUrl);

        // If searchParams does not contain a page value then modify url query string to have page=1
        if (!searchParams.has('page')) {
            const linkUrl = q$('.js-pagination-link').href;
            const re = /page=[0-9]+/i;
            const updatedLinkUrl = linkUrl.replace(re, 'page=1');

            window.history.replaceState({}, document.title, updatedLinkUrl);
        }

        trigger(window, 'statechange');
    }
}

export default FacetedSearch;
