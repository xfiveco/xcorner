export default function ($element, eventName, data = null) {
    if (data === null) {
        $element.dispatchEvent(new Event(eventName), { bubbles: true })
    } else {
        const customEvent = new CustomEvent(eventName, { detail: data })
        $element.dispatchEvent(customEvent, { bubbles: true })
    }
}
