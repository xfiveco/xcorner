import { q$$ } from '../global/selector'

/**
 * We add showing animations to the enclosed elements (children) or to the children elements provided as a [reveal] sttribute
 */
export default class RevealObserverElement extends HTMLElement {
    constructor() {
        super()

        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.3,
        }

        this.revealChildren = []

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    this.revealChildren.forEach((child) => child.classList.add('reveal-observed-intersect'))

                    this.observer.unobserve(this.children[0])

                    setTimeout(() => {
                        this.revealChildren.forEach((child) => {
                            // eslint-disable-next-line no-param-reassign
                            child.style.transitionDelay = '0s'
                        })
                    }, 2000)
                }
            })
        }, options)
    }

    connectedCallback() {
        this.revealChildren = [this.children[0]]

        if (this.hasAttribute('reveal')) {
            this.revealChildren = q$$(this.getAttribute('reveal'), this)
        }

        this.revealChildren.forEach((child, index) => {
            // eslint-disable-next-line no-param-reassign
            child.style.transitionDelay = `${index * 200}ms`

            child.classList.add('reveal-observed-setup')
        })

        this.observer.observe(this.children[0])
    }
}

if (!customElements.get('reveal-observed')) {
    customElements.define('reveal-observed', RevealObserverElement)
}
