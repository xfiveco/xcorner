import q$ from './selector'

export default class StencilDropdown {
    constructor(extendables) {
        this.extendables = extendables
    }

    /**
     * @param $dropDown
     * @param style
     */
    hide($dropDown, style) {
        if (style) {
            $dropDown.setAttribute('style', style)
        }

        // callback "hide"
        if (this.extendables && this.extendables.hide) {
            this.extendables.hide()
        }

        $dropDown.classList.remove('is-open', 'f-open-dropdown')
        $dropDown.classList.add('hidden')
        $dropDown.setAttribute('aria-hidden', 'true')
    }

    show($dropDown, event, style) {
        if (style) {
            $dropDown.setAttribute('style', style)
            $dropDown.setAttribute('aria-hidden', 'false')
        }

        $dropDown.classList.add('is-open', 'f-open-dropdown')
        $dropDown.classList.remove('hidden')
        $dropDown.setAttribute('aria-hidden', 'false')

        // callback "show"
        if (this.extendables && this.extendables.show) {
            this.extendables.show(event)
        }
    }

    bind($dropDownTrigger, $container, style) {
        let modalOpened = false

        $dropDownTrigger.addEventListener('click', (event) => {
            const $cart = q$('.is-open.js-cart-preview')

            if ($cart) {
                $cart.click()
            }

            if ($container.classList.contains('is-open')) {
                this.hide($container, event)
            } else {
                this.show($container, event, style)
            }
        })

        const $body = q$('body')
        $body.addEventListener('click', (e) => {
            // Call onClick handler
            if (this.extendables && this.extendables.onBodyClick) {
                this.extendables.onBodyClick(e, $container)
            }
        })

        $body.addEventListener('keyup', (e) => {
            // If they hit escape and the modal isn't open, close the search
            if (e.which === 27 && !modalOpened) {
                this.hide($container)
            }
        })

        q$('.js-reveal').addEventListener('open.fndtn.reveal', () => {
            modalOpened = true
        })

        q$('.js-reveal').addEventListener('close.fndtn.reveal', () => {
            modalOpened = false
        })

        /* eslint-disable no-unused-expressions */
        q$('.js-drop-down-close')?.addEventListener('click', () => {
            modalOpened = false
            this.hide($container)
        })
    }
}
