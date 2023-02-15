import { q$$ } from '../global/selector';

/**
 * Visually hides the option from user by moving option to an invisible
 * and disabled select placeholder element.
 *
 * $element approach is required rather than simply hiding the option because
 * hidden option can still be included when serializeArray() is called and
 * cause wrong value to be submitted.
 * (eg. if you have option 1, 2, 3 and 2 is hidden, when you select 3,
 * serializeArray() will use the value of 2 instead of 3)
 */
export default function toggleOption($element, show) {
    const currentSelectElement = $element.closest('select'); // the select containing this
    let disabledSelectElement; // the disabled select element
    let selectElement; // the real select element

    if (currentSelectElement.matches(':disabled')) {
        disabledSelectElement = currentSelectElement;
        selectElement = disabledSelectElement.data?.linkedSelectElement;
    } else {
        selectElement = currentSelectElement;
        disabledSelectElement = currentSelectElement.data?.linkedSelectElement;
        
        if (!disabledSelectElement) {
            const $select = document.createElement('select');
            $select.setAttribute('disabled', true);
            $select.style.display = 'none';
            $select.setAttribute('name', currentSelectElement.getAttribute('name'));
            $select.data = { linkedSelectElement: selectElement };

            selectElement.after($select);

            if ('data' in selectElement === false) {
                selectElement.data = {};
            }

            selectElement.data.linkedSelectElement = disabledSelectElement;
        }
    }

    // save the selected option
    const selectedOption = selectElement.querySelector('option:checked');

    // move the option to the correct select element if required
    if (currentSelectElement.matches(':disabled') && show) {
        const previousIndex = $element.data?.index;
        const $elementNowAtPreviousIndex = selectElement.querySelectorAll('option')[previousIndex];

        if ($elementNowAtPreviousIndex) {
            $element.insertBefore($elementNowAtPreviousIndex);
        } else {
            selectElement.append($element);
        }
    } else if (!currentSelectElement.matches(':disabled') && !show) {
        if ('data' in $element === false) {
            /* eslint-disable no-param-reassign */
            $element.data = {};
        }

        $element.data.index = q$$('option', currentSelectElement).indexOf(this);
        disabledSelectElement.append($element);
    }

    // make sure the option is still selected
    selectedOption.setAttribute('selected', true);
}
