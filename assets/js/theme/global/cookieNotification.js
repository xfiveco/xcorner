import hooks from '../common/hooks';
import q$ from './selector';

/**
 * European websites must notify users of cookies to comply with European Union law.
 * This will alert shoppers that this website uses cookies.
 */
export default function () {
    /*
    // Here you can override the default browser alert box by hooking to the 'cookie-privacy-notification' hook.
    hooks.on('cookie-privacy-notification', (event, privacyMessage) => {
        // You can make your own custom modal or alert box appear in your theme using the privacyMessage provided
        myCustomAlert(privacyMessage);

        // Call event.preventDefault() to prevent the default browser alert from occurring in stencil-utils
        event.preventDefault();
    });
    */

    const $privacyDialog = q$('.js-cookie-message');

    if (document.cookie.indexOf('ACCEPT_COOKIE_USAGE') === -1) {
        if ($privacyDialog !== null) {
            $privacyDialog.style.display = 'block';
        }
    }

    /* eslint-disable no-unused-expressions */
    q$('body [data-privacy-accept]')?.addEventListener('click', () => {
        const date = new Date();
        date.setDate(date.getDate() + 365);
        document.cookie = `ACCEPT_COOKIE_USAGE=1;expires=${date.toGMTString()}; path=/`;

        hooks.emit('cookie-privacy-accepted');

        if ($privacyDialog !== null) {
            $privacyDialog.style.display = 'none';
        }
    });
}
