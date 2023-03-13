/**
 * We return if an element is visible or not
 *
 * @export
 * @param {DOMElement} $element
 * @returns Boolean
 */
export default function ($element) {
    return $element.offsetWidth > 0 && $element.offsetHeight > 0;
}
