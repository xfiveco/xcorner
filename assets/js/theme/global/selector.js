/**
 * We return the element queried using native browser function
 *
 * @export
 * @param {string} selector
 * @param {DOMElement} [$context=null]
 * @returns $DOMElement
 */
export default function q$(selector, $context = null) {
    return ($context || document).querySelector(selector)
}

/**
 * We return an array of DOM elements if found using the $context element if provided
 *
 * @export
 * @param {string} selector
 * @param {DOMElement} [$context=null]
 * @returns Array[DOMElement]
 */
export function q$$(selector, $context = null) {
    if ($context instanceof Element || $context instanceof HTMLDocument || !$context) {
        return Array.from(($context || document).querySelectorAll(selector))
    }
}
/**
 * We get all parent elemnts in order to replace jQuery#parents
 * [https://gist.github.com/ziggi/2f15832b57398649ee9b]
 *
 * @export
 * @param {string} selector
 * @param {DOMElement} $context
 * @returns Array<DOMElement>
 */
export function parents(selector, $context) {
    const elements = []
    let elem = $context
    const ishaveselector = selector !== undefined

    /* eslint-disable no-cond-assign */
    while ((elem = elem.parentElement) !== null) {
        if (!ishaveselector || elem.matches(selector)) {
            elements.push(elem)
        }
    }

    return elements
}

/**
 * Native implementation of jQuery.prev()
 *
 * @param {DOMElement} $currentElement
 * @param {String} selector
 * @returns DOMElement | null
 */
export function prev($currentElement = null, selector) {
    if ($currentElement === null) {
        return null
    }

    let $element = $currentElement.previousElementSibling

    while ($element !== null) {
        const $found = $element.matches(selector) ? $element : null

        if ($found) {
            return $found
        }

        $element = $element.previousElementSibling
    }

    return null
}
