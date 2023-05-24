const ENTER_KEY_CODE = 13
const SPACE_KEY_CODE = 32

/**
 * We update element class and ARIA attribute
 *
 * @param {DOMElement} $element the element we want to update sttributes on
 */
function updateAttributes($element) {
    $element.classList.toggle('is-open')

    // If the attribute doesn't exists, it defaults to false which is desirable
    const ariaExpanded = $element.getAttribute('aria-expanded') === 'true'
    $element.setAttribute('aria-expanded', !ariaExpanded)

    /* eslint-disable no-param-reassign */
    if ('hasUHidden' in $element.dataset) {
        $element.classList.add('u-hidden')
        delete $element.dataset.hasUHidden

        return
    }

    if ($element.classList.contains('u-hidden')) {
        $element.classList.remove('u-hidden')
        $element.dataset.hasUHidden = true
    }
    /* eslint-enable no-param-reassign */
}

/**
 * We update the element where the event occured and all the elements we want to update
 *
 * @param {DOMElement} $processElement
 * @param {DOMElement} target
 * @param {Array<string>} update
 * @param {Array<fucntion>} callbacks
 */
function processChange($processElement, target, update, callbacks) {
    update.forEach((updateSelector) => {
        if (updateSelector === 'this') {
            updateAttributes($processElement)

            return
        }

        const $elements = document.querySelectorAll(updateSelector)

        if ($elements.length) {
            $elements.forEach(($element) => updateAttributes($element))
        }
    })

    callbacks.forEach((fn) => fn($processElement, target))
}

/**
 * If the event is triggered on a link element and this have an `href` attribute set, we should follow it instead of processing the event
 *
 * @param   {DOMElement} $element
 * @returns {boolean}
 */
function isLinkWithAddress($element) {
    return $element.tagName.toLowerCase() === 'a' && $element.href !== '' && $element.href !== '#'
}

/**
 * We add/remove (toggle) the 'is-open' CSS class to the DOM elements selected with the provided [[selector]].
 * We toggle this CSS class on all the elements selected by an array of selectors provided in the [[update]] attribute.
 *
 * If you need the trigger element update its attributes the same way the [[update]] elements are, pass 'this' in the [[update]] array.
 *
 * @param {string} selector Selector where we want to attach the click event to (it's a selector to all elements present)
 * @param {string} update List of selector for all the elements we want to update when the [[selector]] is changed
 *
 * @example
 * we have three <button> elements with CSS class of '.button-toggle' and each one should toggle the same menu list with class '.menu-list'.
 * Each should also add the 'is-open' class to an UI elment with CSS class '.alert' alerting the user of this change:
 *
 * toggle('button.button-toggle', {
 *    update: [
 *       '.menu-list',
 *       '.alert'
 *    ],
 * });
 *
 * @example
 * When clicking a '.menu-item' in the menu, we should open/close the sub-menu items inside of it.
 *
 * toggle('.menu-item', { update: [ 'this' ]});
 */
export default function toggle(selector, { update = [], callbacks = [] } = {}) {
    const $toggleElements = Array.from(document.querySelectorAll(selector))
    if ($toggleElements.length === 0) {
        return
    }

    /* eslint func-names: off */
    $toggleElements.forEach(($toggleElement) => {
        $toggleElement.addEventListener('click', function (event) {
            if (isLinkWithAddress(event.target) === false) {
                processChange(this, event.target, update, callbacks)
            }
        })

        $toggleElement.addEventListener('keypress', function (event) {
            if (event.keyCode === ENTER_KEY_CODE || event.keyCode === SPACE_KEY_CODE) {
                if (isLinkWithAddress(event.target) === false) {
                    processChange(this, event.target, update, callbacks)
                }
            }
        })
    })
}
