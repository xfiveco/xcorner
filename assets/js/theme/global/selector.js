/**
 * We return the element queried using native browser function
 *
 * @export
 * @param {string} selector 
 * @param {DOMElement} [$context=null] 
 * @returns $DOMElement
 */
export default function q$(selector, $context = null) {
  return ($context || document).querySelector(selector);
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
  return Array.from(($context || document).querySelectorAll(selector));
}
