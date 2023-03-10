import collapsibleFactory from '../common/collapsible';
import collapsibleGroupFactory from '../common/collapsible-group';
import q$ from './selector';

const PLUGIN_KEY = 'menu';

/*
 * Manage the behaviour of a menu
 * @param {jQuery} $menu
 */
class Menu {
    constructor($menu) {
        this.$menu = $menu;
        this.$body = q$('body');
        this.hasMaxMenuDisplayDepth = this.$body.querySelector('.js-nav-pages-list')?.classList.contains('js-nav-pages-list-depth-max');

        // Init collapsible
        this.collapsibles = collapsibleFactory('[data-collapsible]', { $context: this.$menu });
        this.collapsibleGroups = collapsibleGroupFactory('#menu');

        // Auto-bind
        this.onMenuClick = this.onMenuClick.bind(this);
        this.onDocumentClick = this.onDocumentClick.bind(this);

        // Listen
        this.bindEvents();
    }

    collapseAll() {
        this.collapsibles.forEach(collapsible => collapsible.close());
        this.collapsibleGroups.forEach(group => group.close());
    }

    collapseNeighbors($neighbors) {
        const $collapsibles = collapsibleFactory('[data-collapsible]', { $context: $neighbors });

        $collapsibles.forEach($collapsible => $collapsible.close());
    }

    bindEvents() {
        this.$menu.addEventListener('click', this.onMenuClick);
        this.$body.addEventListener('click', this.onDocumentClick);
    }

    unbindEvents() {
        this.$menu.removeEventListener('click', this.onMenuClick);
        this.$body.removeEventListener('click', this.onDocumentClick);
    }

    onMenuClick(event) {
        event.stopPropagation();

        if (this.hasMaxMenuDisplayDepth) {
            const $neighbors = Array.from(event.target.parentNode.children);

            this.collapseNeighbors($neighbors);
        }
    }

    onDocumentClick() {
        this.collapseAll();
    }
}

/*
 * Create a new Menu instance
 * @param {string} [selector]
 * @return {Menu}
 */
export default function menuFactory(selector = '.js-menu') {
    const $menu = q$(selector);
    const instanceKey = `${PLUGIN_KEY}Instance`;
    const cachedMenu = 'data' in $menu ? $menu.data[instanceKey] : null;

    if (cachedMenu instanceof Menu) {
        return cachedMenu;
    }

    const menu = new Menu($menu);

    if ('data' in $menu === false) {
        $menu.data = {};
    }

    $menu.data[instanceKey] = menu;

    return menu;
}
