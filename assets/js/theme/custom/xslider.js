export default class XsliderComponent extends HTMLElement {
    constructor() {
        super()

        const $template = document.getElementById('xslider-component-template')

        this.attachShadow({ mode: 'open' })
        this.shadowRoot.appendChild($template.content.cloneNode(true))
    }

    connectedCallback() {
        this.DESKTOP_COLUMNS = parseInt(this.getAttribute('desktop-columns'), 10) || 3

        this.currentSlide = 0
        this.visibleCards = this.DESKTOP_COLUMNS

        const mql = window.matchMedia('(min-width: 750px)')

        this.visibleCards = mql.matches ? this.DESKTOP_COLUMNS : 1
        this.slides = this.querySelectorAll('[id^="Slide-"]')

        this.$prevButton = this.querySelector('.slider-button--prev')
        this.$nextButton = this.querySelector('.slider-button--next')

        if (this.$prevButton === null || this.$nextButton === null) {
            return
        }

        const scrollOptions = {
            behavior: 'smooth',
            block: 'nearest',
            inline: 'start',
        }

        this.$prevButton.classList.add('hidden')

        if (this.visibleCards === this.DESKTOP_COLUMNS && this.slides.length <= this.DESKTOP_COLUMNS) {
            this.$nextButton.classList.add('hidden')
        }

        this.$prevButton.addEventListener('click', () => {
            this.currentSlide -= 1

            this.$nextButton.classList.remove('hidden')

            if (this.currentSlide <= 0) {
                this.currentSlide = 0
                this.$prevButton.classList.add('hidden')
            } else {
                this.$prevButton.classList.remove('hidden')
            }

            this.scrollIntoView({ block: 'center' })

            this.slides[this.currentSlide].scrollIntoView(scrollOptions)
        })

        this.$nextButton.addEventListener('click', () => {
            this.currentSlide += 1
            const nextSlide = this.currentSlide + (this.visibleCards - 1)

            this.$prevButton.classList.remove('hidden')

            if (nextSlide >= this.slides.length - 1) {
                this.currentSlide = this.slides.length - this.visibleCards
                this.$nextButton.classList.add('hidden')
            } else {
                this.$nextButton.classList.remove('hidden')
            }

            this.scrollIntoView({ block: 'center' })

            this.slides[nextSlide].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'end',
            })
        })

        mql.addEventListener('change', ({ matches }) => {
            this.visibleCards = matches ? this.DESKTOP_COLUMNS : 1
            this.currentSlide = 0

            this.slides[this.currentSlide].scrollIntoView(scrollOptions)
            this.$prevButton.classList.add('hidden')

            if (this.visibleCards === this.DESKTOP_COLUMNS && this.slides.length <= this.DESKTOP_COLUMNS) {
                this.$nextButton.classList.add('hidden')
            } else {
                this.$nextButton.classList.remove('hidden')
            }
        })
    }
}
