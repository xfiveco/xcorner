import * as focusTrap from 'focus-trap';
import q$, { q$$ } from './selector';

const bodyActiveClass = 'has-active-modal';
const loadingOverlayClass = 'js-loading-overlay';
const modalBodyClass = 'js-modal-body';
const modalContentClass = 'js-modal-content';

const SizeClasses = {
    small: 'is-modal-small',
    large: 'is-modal-large',
    normal: '',
};

export const ModalEvents = {
    close: 'close.fndtn.reveal',
    closed: 'closed.fndtn.reveal',
    open: 'open.fndtn.reveal',
    opened: 'opened.fndtn.reveal',
    loaded: 'loaded.data.custom',
};

function getSizeFromModal($modal) {
    if ($modal.classList.contains(SizeClasses.small)) {
        return 'small';
    }

    if ($modal.classList.contains(SizeClasses.large)) {
        return 'large';
    }

    return 'normal';
}

function getViewportHeight(multipler = 1) {
    const viewportHeight = window.innerHeight;

    return viewportHeight * multipler;
}

function wrapModalBody(content) {
    const $modalBody = document.createElement('div');

    $modalBody.classList.add(modalBodyClass);
    $modalBody.innerHTML = content;

    return $modalBody;
}

function restrainContentHeight($content) {
    if ($content === null) return;

    const $body = q$(`.${modalBodyClass}`, $content);

    if ($body === null) return;

    const bodyHeight = $body.getBoundingclientRect().height;
    const contentHeight = $content.getBoundingclientRect().height;
    const viewportHeight = getViewportHeight(0.9);
    const maxHeight = viewportHeight - (contentHeight - bodyHeight);

    $body.style.maxHeight = maxHeight;
}

function createModalContent($modal) {
    let $content = q$(`.${modalContentClass}`, $modal);

    if ($content === null) {
        const existingContent = [...$modal.children];

        $content = document.createElement('div');
        $content.classList.add(modalContentClass);

        existingContent.forEach($child => $content.append($child));
        $modal.append($content);
    }

    return $content;
}

function createLoadingOverlay($modal) {
    let $loadingOverlay = q$(`.${loadingOverlayClass}`, $modal);

    if ($loadingOverlay === null) {
        $loadingOverlay = document.createElement('div');
        $loadingOverlay.classList.add(loadingOverlayClass);

        $modal.append($loadingOverlay);
    }

    return $loadingOverlay;
}

/**
 * Require foundation.reveal
 * Decorate foundation.reveal with additional methods
 * @param {DOMElement} $modal
 * @param {Object} [options]
 * @param {string} [options.size]
 */
export class Modal {
    constructor($modal, {
        size = null,
    } = {}) {
        this.$modal = $modal;
        this.$content = createModalContent(this.$modal);
        this.$overlay = createLoadingOverlay(this.$modal);
        this.defaultSize = size || getSizeFromModal($modal);
        this.size = this.defaultSize;
        this.pending = false;
        this.$preModalFocusedEl = null;
        this.focusTrap = null;

        this.onModalOpen = this.onModalOpen.bind(this);
        this.onModalOpened = this.onModalOpened.bind(this);
        this.onModalClose = this.onModalClose.bind(this);
        this.onModalClosed = this.onModalClosed.bind(this);

        this.bindEvents();

        /* STRF-2471 - Multiple Wish Lists - prevents double-firing
         * of foundation.dropdown click.fndtn.dropdown event */
        /* eslint-disable no-unused-expressions */
        this.$modal.querySelector('.js-dropdown-menu-button')?.addEventListener('click', e => {
            e.stopPropagation();
        });
    }

    get pending() {
        return this._pending;
    }

    set pending(pending) {
        this._pending = pending;

        if (pending) {
            this.$overlay.style.display = 'block';
        } else {
            this.$overlay.style.display = 'none';
        }
    }

    get size() {
        return this._size;
    }

    set size(size) {
        this._size = size;

        this.$modal.classList.remove(SizeClasses.small);
        this.$modal.classList.remove(SizeClasses.large);

        if (size !== 'normal') {
            this.$modal.classList.add(SizeClasses[size]);
        }
    }

    bindEvents() {
        this.$modal.addEventListener(ModalEvents.close, this.onModalClose);
        this.$modal.addEventListener(ModalEvents.closed, this.onModalClosed);
        this.$modal.addEventListener(ModalEvents.open, this.onModalOpen);
        this.$modal.addEventListener(ModalEvents.opened, this.onModalOpened);
    }

    open({
        size,
        pending = true,
        clearContent = true,
    } = {}) {
        this.pending = pending;

        if (size) {
            this.size = size;
        }

        if (clearContent) {
            this.clearContent();
        }

        this.$modal.style.display = 'block';
    }

    close() {
        this.$modal.style.display = 'none';
    }

    updateContent(content, { wrap = false } = {}) {
        let $content = null;

        if (wrap) {
            $content = wrapModalBody(content);
        }

        this.pending = false;
        this.$content.append($content === null ? content : $content);
        $(this.$modal).trigger(ModalEvents.loaded);

        restrainContentHeight(this.$content);
    }

    clearContent() {
        this.$content.innerHTML = '';
    }

    setupFocusTrap() {
        if (!this.$preModalFocusedEl) this.$preModalFocusedEl = document.activeElement;

        if (!this.focusTrap) {
            this.focusTrap = focusTrap.createFocusTrap(this.$modal[0], {
                escapeDeactivates: false,
                returnFocusOnDeactivate: false,
                allowOutsideClick: true,
                fallbackFocus: () => {
                    const fallbackNode = this.$preModalFocusedEl && (this.$preModalFocusedEl !== null)
                        ? this.$preModalFocusedEl
                        : q$('[data-header-logo-link]');

                    return fallbackNode;
                },
            });
        }

        this.focusTrap.deactivate();
        this.focusTrap.activate();
    }

    onModalClose() {
        q$('body').classList.remove(bodyActiveClass);
    }

    onModalClosed() {
        this.size = this.defaultSize;

        if (this.focusTrap) this.focusTrap.deactivate();

        if (this.$preModalFocusedEl) this.$preModalFocusedEl.focus();

        this.$preModalFocusedEl = null;
    }

    onModalOpen() {
        q$('body').classList.add(bodyActiveClass);
    }

    onModalOpened() {
        if (this.pending) {
            this.$modal.addEventListener(ModalEvents.loaded, () => {
                if (this.$modal.classList.contains('open')) this.setupFocusTrap();
            }, { once: true });
        } else {
            this.setupFocusTrap();
        }

        restrainContentHeight(this.$content);
    }
}

/**
 * Return an array of modals
 * @param {string} selector
 * @param {Object} [options]
 * @param {string} [options.size]
 * @returns {array}
 */
export default function modalFactory(selector = '[data-reveal]', options = {}) {
    const $modals = q$$(selector, options.$context);

    return $modals.map(element => {
        const $modal = element;
        const cachedModal = $modal.data?.modalInstance;

        if (cachedModal instanceof Modal) {
            return cachedModal;
        }

        const modal = new Modal($modal, options);

        if ('data' in $modal === false) {
            $modal.data = {};
        }

        $modal.data.modalInstance = modal;

        return modal;
    });
}

/*
 * Return the default page modal
 */
export function defaultModal() {
    return modalFactory('#modal');
}

/*
 * Return the default alert modal
 */
export function alertModal() {
    return modalFactory('#alert-modal');
}

/*
 * Display the given message in the default alert modal
 */
export function showAlertModal(message, options = {}) {
    const modal = alertModal();
    const $cancelBtn = modal.$modal.querySelector('.js-cancel');
    const $confirmBtn = modal.$modal.querySelector('.js-confirm');
    const {
        icon = 'error',
        $preModalFocusedEl = null,
        showCancelButton,
        onConfirm,
    } = options;

    if ($preModalFocusedEl) {
        modal.$preModalFocusedEl = $preModalFocusedEl;
    }

    modal.open();
    modal.$modal.querySelector('.js-alert-icon').style.display = 'none';

    if (icon === 'error') {
        modal.$modal.querySelector('.js-error-icon').style.display = 'block';
    } else if (icon === 'warning') {
        modal.$modal.querySelector('.js-warning-icon').style.display = 'block';
    }

    modal.updateContent(`<span>${message}</span>`);

    if (onConfirm) {
        $confirmBtn.addEventListener('click', onConfirm);

        modal.$modal.addEventListener(ModalEvents.closed, () => {
            $confirmBtn.removeEventListener('click', onConfirm);
        }, { once: true });
    }

    if (showCancelButton) {
        $cancelBtn.style.display = 'block';
    } else {
        $cancelBtn.style.display = 'none';
    }
}
