import _ from 'lodash';

export default class TextTruncate {
    constructor($element) {
        this.$element = $element;
        this.contentClass = 'textTruncate--visible';
        this.options = $element.data('textTruncate') || {
            css: {},
            text: {
                viewMore: '',
                viewLess: '',
            },
        };
        this.defaultCssOptions = {
            'max-height': '',
            'text-overflow': 'ellipsis',
        };
    }

    init() {
        this.setupAnchor();
        this.parseDataAttributes();
    }

    setupAnchor() {
        // create "view more" anchor
        this.createViewAnchor();
        this.appendViewAnchor();
        this.bindAnchor();
    }

    createViewAnchor() {
        this.$viewAnchor = document.createElement('a');
        this.$viewAnchor.classList.add('textTruncate-viewMore');
        this.$viewAnchor.textContent = this.options.open ? this.options.text.viewLess : this.options.text.viewMore;
        this.$viewAnchor.href = '#';
    }

    appendViewAnchor() {
        this.$element.append(this.$viewAnchor);
    }

    bindAnchor() {
        // bind anchor to this scope
        this.$viewAnchor.addEventListener('click', e => {
            e.preventDefault();
            // toggle state
            this.toggleState();
        });
    }

    toggleState() {
        this.$element.toggleClass(this.contentClass);

        if (this.$element.hasClass(this.contentClass)) {
            this.showText();
        } else {
            this.hideText();
        }
    }

    showText() {
        if (this.options.css['max-height']) {
            this.$element.css('max-height', '');
        }
        this.$viewAnchor.textContent = this.options.text.viewLess;
    }

    hideText() {
        if (this.options.css['max-height']) {
            this.$element.css('max-height', this.options.css['max-height']);
        }
        this.$viewAnchor.textContent = this.options.text.viewMore;
    }

    parseDataAttributes() {
        // override default css options
        _.forOwn(this.defaultCssOptions, (value, key) => {
            this.$element.css(key, value);
        });
    }
}
