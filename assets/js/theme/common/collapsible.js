import { extend } from 'lodash'
import mediaQueryListFactory from './media-query-list'
import q$, { q$$ } from '../global/selector'
import isVisible from './utils/is-visible'
import trigger from './utils/trigger'

export const CollapsibleEvents = {
    open: 'open.collapsible',
    close: 'close.collapsible',
    toggle: 'toggle.collapsible',
    click: 'click.collapsible',
}

const CollapsibleState = {
    closed: 'closed',
    open: 'open',
}

/**
 * @param {string} id
 * @returns {string}
 */
function prependHash(id) {
    if (id && id.indexOf('#') === 0) {
        return id
    }

    if (id && id[0] === '.') {
        return id
    }

    return `#${id}`
}

/**
 * @param {HTMLElement} $element
 * @returns {object}
 */
function optionsFromData($element) {
    return {
        disabledBreakpoint: $element.dataset.collapsibleDisabledBreakpoint,
        disabledState: $element.dataset.collapsibleDisabledState,
        enabledState: $element.dataset.collapsibleEnabledState,
        openClassName: $element.dataset.collapsibleOpenClassName,
    }
}

/**
 * Collapse/Expand toggle
 */
export class Collapsible {
    /**
     * @param {jQuery} $toggle - Trigger button
     * @param {jQuery} $target - Content to collapse / expand
     * @param {Object} [options] - Configurable options
     * @param {Object} [options.$context]
     * @param {String} [options.disabledBreakpoint]
     * @param {Object} [options.disabledState]
     * @param {Object} [options.enabledState]
     * @param {String} [options.openClassName]
     * @example
     *
     * <button id="#more">Collapse</button>
     * <div id="content">...</div>
     *
     * new Collapsible($('#more'), $('#content'));
     */
    constructor($toggle, $target, { disabledBreakpoint, disabledState, enabledState, openClassName = 'is-open' } = {}) {
        this.$toggle = $toggle
        this.$target = $target
        this.targetId = $target.id
        this.openClassName = openClassName
        this.disabledState = disabledState
        this.enabledState = enabledState

        if (disabledBreakpoint) {
            this.disabledMediaQueryList = mediaQueryListFactory(disabledBreakpoint)
        }

        if (this.disabledMediaQueryList) {
            this.disabled = this.disabledMediaQueryList.matches
        } else {
            this.disabled = false
        }

        // Auto-bind
        this.onClicked = this.onClicked.bind(this)
        this.onDisabledMediaQueryListMatch = this.onDisabledMediaQueryListMatch.bind(this)

        // Assign DOM attributes
        this.$target.setAttribute('aria-hidden', this.isCollapsed)
        this.$toggle.setAttribute('aria-label', this._getToggleAriaLabelText($toggle))
        this.$toggle.setAttribute('aria-controls', $target.id)
        this.$toggle.setAttribute('aria-expanded', this.isOpen)

        // Listen
        this.bindEvents()
    }

    get isCollapsed() {
        return isVisible(this.$target) === false && !this.$target.classList.contains(this.openClassName)
    }

    get isOpen() {
        return !this.isCollapsed
    }

    /**
     * @param {string} disabled
     */
    set disabled(disabled) {
        this._disabled = disabled

        if (disabled) {
            this.toggleByState(this.disabledState)
        } else {
            this.toggleByState(this.enabledState)
        }
    }

    /**
     * @returns {string}
     */
    get disabled() {
        return this._disabled
    }

    /**
     * @param {HTMLElement} $toggle
     * @returns {string}
     */
    _getToggleAriaLabelText($toggle) {
        const $textToggleChildren = Array.from($toggle.children).filter((child) => child.textContent.trim())
        const $ariaLabelTarget = $textToggleChildren.length ? $textToggleChildren[0] : $toggle

        return $ariaLabelTarget.textContent.trim()
    }

    open({ notify = true } = {}) {
        this.$toggle.classList.add(this.openClassName)
        this.$toggle.setAttribute('aria-expanded', true)

        this.$target.classList.add(this.openClassName)
        this.$target.setAttribute('aria-hidden', false)

        if (notify) {
            trigger(this.$toggle, CollapsibleEvents.open, [this])
            trigger(this.$toggle, CollapsibleEvents.toggle, [this])
        }
    }

    close({ notify = true } = {}) {
        this.$toggle.classList.remove(this.openClassName)
        this.$toggle.setAttribute('aria-expanded', false)

        this.$target.classList.remove(this.openClassName)
        this.$target.setAttribute('aria-hidden', true)

        if (notify) {
            trigger(this.$toggle, CollapsibleEvents.close, [this])
            trigger(this.$toggle, CollapsibleEvents.toggle, [this])
        }
    }

    toggle() {
        if (this.isCollapsed) {
            this.open()
        } else {
            this.close()
        }
    }

    /**
     * @param {string} state
     * @param  {...any} args
     * @returns {any|undefined}
     */
    toggleByState(state, ...args) {
        switch (state) {
            case CollapsibleState.open:
                return this.open.apply(this, args)

            case CollapsibleState.closed:
                return this.close.apply(this, args)

            default:
                return undefined
        }
    }

    /**
     * @param {object} collapsibleInstance
     * @returns {object}
     */
    hasCollapsible(collapsibleInstance) {
        return this.$target.contains(collapsibleInstance.$target)
    }

    bindEvents() {
        this.$toggle.addEventListener('click', this.onClicked)

        if (this.disabledMediaQueryList && this.disabledMediaQueryList.addEventListener) {
            this.disabledMediaQueryList.addEventListener('change', this.onDisabledMediaQueryListMatch)
        }
    }

    unbindEvents() {
        this.$toggle.removeEventListener('click', this.onClicked)

        if (this.disabledMediaQueryList && this.disabledMediaQueryList.removeEventListener) {
            this.disabledMediaQueryList.removeEventListener('change', this.onDisabledMediaQueryListMatch)
        }
    }

    /**
     * @param {Event} event
     */
    onClicked(event) {
        if (this.disabled) {
            return
        }

        event.preventDefault()

        this.toggle()
    }

    onDisabledMediaQueryListMatch(media) {
        this.disabled = media.matches
    }
}

/**
 * Convenience method for constructing Collapsible instance
 *
 * @param {string} [selector]
 * @param {Object} [overrideOptions]
 * @param {Object} [overrideOptions.$context]
 * @param {String} [overrideOptions.disabledBreakpoint]
 * @param {Object} [overrideOptions.disabledState]
 * @param {Object} [overrideOptions.enabledState]
 * @param {String} [overrideOptions.openClassName]
 * @return {Array} array of Collapsible instances
 *
 * @example
 * <a href="#content" data-collapsible>Collapse</a>
 * <div id="content">...</div>
 *
 * collapsibleFactory();
 */
export default function collapsibleFactory(selector = '[data-collapsible]', overrideOptions = {}) {
    const $collapsibles = q$$(selector, overrideOptions.$context)

    const collapsibles = $collapsibles.map((element) => {
        const $toggle = element
        const cachedCollapsible = $toggle.data?.collapsibleInstance

        if (cachedCollapsible instanceof Collapsible) {
            return cachedCollapsible
        }

        const targetId = prependHash($toggle.dataset.collapsible || $toggle.dataset.collapsibleTarget || $toggle.href)

        const options = extend(optionsFromData($toggle), overrideOptions)
        const collapsible = new Collapsible($toggle, q$(targetId, overrideOptions.$context), options)

        if ('data' in $toggle === false) {
            $toggle.data = {}
        }

        $toggle.data.collapsibleInstance = collapsible

        return collapsible
    })

    if (collapsibles.length > 1) {
        return collapsibles
    }

    return collapsibles[0]
}
