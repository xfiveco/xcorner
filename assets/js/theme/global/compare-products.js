import { showAlertModal } from './modal';
import q$, { q$$ } from './selector';

function decrementCounter(counter, item) {
    const index = counter.indexOf(item);

    if (index > -1) {
        counter.splice(index, 1);
    }
}

function incrementCounter(counter, item) {
    counter.push(item);
}

function updateCounterNav(counter, $link, urls) {
    if (counter.length !== 0) {
        if (!($link.offsetWidth > 0 && $link.offsetHeight > 0)) {
            $link.classList.add('show');
        }

        $link.setAttribute('href', `${urls.compare}/${counter.join('/')}`);

        /* eslint-disable no-param-reassign */
        $link
            .querySelector('span.js-count-pill')
            .innerHTML = counter.length;
    } else {
        $link.classList.remove('show');
    }
}

export default function ({ noCompareMessage, urls }) {
    let compareCounter = [];

    const $compareLink = q$('a[data-compare-nav]');

    $('body').on('compare-reset', () => {
        const $checked = q$$('input[name="products\[\]"]:checked', q$('body'));

        compareCounter = $checked.length ? $checked.map(element => element.value) : [];
        updateCounterNav(compareCounter, $compareLink, urls);
    });

    $('body').triggerHandler('compare-reset');

    /* eslint-disable no-unused-expressions */
    q$('[data-compare-id]')?.addEventListener('click', event => {
        const product = event.currentTarget.value;
        const $clickedCompareLink = q$('a[data-compare-nav]');

        if (event.currentTarget.checked) {
            incrementCounter(compareCounter, product);
        } else {
            decrementCounter(compareCounter, product);
        }

        updateCounterNav(compareCounter, $clickedCompareLink, urls);
    });

    q$('a[data-compare-nav]').addEventListener('click', () => {
        const $clickedCheckedInput = q$$('input[name="products\[\]"]:checked', q$('body'));

        if ($clickedCheckedInput.length <= 1) {
            showAlertModal(noCompareMessage);
            return false;
        }
    });
}
