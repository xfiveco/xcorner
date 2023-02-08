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
	const elements = [];
	let elem = $context;
	var ishaveselector = selector !== undefined;
 
	while ((elem = elem.parentElement) !== null) {
		if (elem.nodeType !== Node.ELEMENT_NODE) {
			continue;
		}
 
		if (!ishaveselector || elem.matches(selector)) {
			elements.push(elem);
		}
	}
 
	return elements;
}
