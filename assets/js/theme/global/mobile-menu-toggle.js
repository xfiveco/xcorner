import _ from 'lodash';
import mediaQueryListFactory from '../common/media-query-list';
import { CartPreviewEvents } from './cart-preview';
import q$, { q$$ } from './selector';

const PLUGIN_KEY = {
    CAMEL: 'mobileMenuToggle',
    SNAKE: 'mobile-menu-toggle',
};

function optionsFromData($element) {
    const mobileMenuId = $($element).data(PLUGIN_KEY.CAMEL);

    return {
        menuSelector: mobileMenuId && `#${mobileMenuId}`,
    };
}

/*
 * Manage the behaviour of a mobile menu
 * @param {jQuery} $toggle
 * @param {Object} [options]
 * @param {Object} [options.headerSelector]
 * @param {Object} [options.menuSelector]
 * @param {Object} [options.scrollViewSelector]
 */
export class MobileMenuToggle {
    constructor($toggle, {
        headerSelector = '.header',
        menuSelector = '#menu',
        scrollViewSelector = '.navPages',
    } = {}) {
        this.$body = q$('body');
        this.$menu = q$(menuSelector);
        this.$navList = q$('.navPages-list.navPages-list-depth-max');
        this.$header = q$(headerSelector);
        this.$scrollView = q$(scrollViewSelector, this.$menu);
        this.$subMenus = q$$('.navPages-action', this.$navList);
        this.$toggle = $toggle;
        this.mediumMediaQueryList = mediaQueryListFactory('medium');

        // Auto-bind
        this.onToggleClick = this.onToggleClick.bind(this);
        this.onCartPreviewOpen = this.onCartPreviewOpen.bind(this);
        this.onMediumMediaQueryMatch = this.onMediumMediaQueryMatch.bind(this);
        this.onSubMenuClick = this.onSubMenuClick.bind(this);

        // Listen
        this.bindEvents();

        // Assign DOM attributes
        this.$toggle.setAttribute('aria-controls', this.$menu.getAttribute('id'));

        // Hide by default
        this.hide();
    }

    get isOpen() {
        return this.$menu.classList.contains('is-open');
    }

    bindEvents() {
        this.$toggle.addEventListener('click', this.onToggleClick);
        $(this.$header).on(CartPreviewEvents.open, this.onCartPreviewOpen);
        this.$subMenus.forEach($subMenu => $subMenu.addEventListener('click', this.onSubMenuClick));

        if (this.mediumMediaQueryList && this.mediumMediaQueryList.addListener) {
            this.mediumMediaQueryList.addListener(this.onMediumMediaQueryMatch);
        }
    }

    unbindEvents() {
        this.$toggle.removeEventListener('click', this.onToggleClick);
        $(this.$header).off(CartPreviewEvents.open, this.onCartPreviewOpen);

        if (this.mediumMediaQueryList && this.mediumMediaQueryList.addListener) {
            this.mediumMediaQueryList.removeListener(this.onMediumMediaQueryMatch);
        }
    }

    toggle() {
        if (this.isOpen) {
            this.hide();
        } else {
            this.show();
        }
    }

    show() {
        this.$body.classList.add('has-activeNavPages');

        this.$toggle.classList.add('is-open');
        this.$toggle.setAttribute('aria-expanded', true);

        this.$menu.classList.add('is-open');

        this.$header.classList.add('is-open');
        this.$scrollView.scrollIntoView(true);

        this.resetSubMenus();
    }

    hide() {
        this.$body.classList.remove('has-activeNavPages');

        this.$toggle.classList.remove('is-open');
        this.$toggle.setAttribute('aria-expanded', false);

        this.$menu.classList.remove('is-open');

        this.$header.classList.remove('is-open');

        this.resetSubMenus();
    }

    // Private
    onToggleClick(event) {
        event.preventDefault();

        this.toggle();
    }

    onCartPreviewOpen() {
        if (this.isOpen) {
            this.hide();
        }
    }

    onMediumMediaQueryMatch(media) {
        if (!media.matches) {
            return;
        }

        this.hide();
    }

    onSubMenuClick(event) {
        const $closestAction = event.target.closest('.navPages-action');
        const $parentSiblings = Array.from($closestAction.parentNode.children);
        const $parentAction = q$$('.navPages-action', $closestAction.closest('.navPage-subMenu-horizontal'));

        if (this.$subMenus.classList.contains('is-open')) {
            this.$navList.classList.add('subMenu-is-open');
        } else {
            this.$navList.classList.remove('subMenu-is-open');
        }

        if (event.target.classList.contains('is-open')) {
            $parentSiblings.forEach($el => $el.classList.add('is-hidden'));
            $parentAction.forEach($el => $el.classList.add('is-hidden'));
        } else {
            $parentSiblings.classList.remove('is-hidden');
            $parentAction.classList.remove('is-hidden');
        }
    }

    resetSubMenus() {
        q$$('.is-hidden', this.$navList).forEach($el => $el.classList.remove('is-hidden'));
        /* eslint-disable no-unused-expressions */
        this.$navList?.classList.remove('subMenu-is-open');
    }
}

/*
 * Create a new MobileMenuToggle instance
 * @param {string} [selector]
 * @param {Object} [options]
 * @param {Object} [options.headerSelector]
 * @param {Object} [options.menuSelector]
 * @param {Object} [options.scrollViewSelector]
 * @return {MobileMenuToggle}
 */
export default function mobileMenuToggleFactory(selector = `[data-${PLUGIN_KEY.SNAKE}]`, overrideOptions = {}) {
    const $toggle = q$(selector);
    const instanceKey = `${PLUGIN_KEY.CAMEL}Instance`;
    const cachedMobileMenu = $($toggle).data(instanceKey);

    if (cachedMobileMenu instanceof MobileMenuToggle) {
        return cachedMobileMenu;
    }

    const options = _.extend(optionsFromData($toggle), overrideOptions);
    const mobileMenu = new MobileMenuToggle($toggle, options);

    $($toggle).data(instanceKey, mobileMenu);

    return mobileMenu;
}
