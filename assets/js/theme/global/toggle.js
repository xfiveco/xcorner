export default function toggle($element) {
    if (window.getComputedStyle($element).display === 'none') {
        /* eslint-disable no-param-reassign */
        $element.style.display = 'block'
    } else {
        $element.style.display = 'none'
    }
}
