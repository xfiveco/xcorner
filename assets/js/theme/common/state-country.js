import utils from '@bigcommerce/stencil-utils'
import _ from 'lodash'
import { insertStateHiddenField } from './utils/form-utils'
import { showAlertModal } from '../global/modal'
import q$, { q$$ } from '../global/selector'

/**
 * If there are no options from bcapp, a text field will be sent. This will create a select element to hold options after the remote request.
 * @returns {HTMLElement}
 */
function makeStateRequired(stateElement, context) {
    /* eslint-disable no-param-reassign */
    stateElement.innerHTML = `
        <select 
            id=${stateElement.id}
            name=${stateElement.getAttribute('name')}
            data-label=${stateElement.dataset.label}
            data-field-type=${stateElement.dataset.fieldType}
        >
        </select>
    `

    const $hiddenInput = q$$('[name*="FormFieldIsText"]')
    $hiddenInput.forEach(($hi) => $hi.remove())

    const $newElement = q$('[data-field-type="State"]')
    const $prevElement = $newElement.previousElementSibling
    if ($prevElement.querySelector('small') === null) {
        // String is injected from localizer
        $prevElement.insertAdjacentHTML('beforeend', `<small>${context.required}</small>`)
    } else {
        $prevElement.querySelector('small').style.display = 'block'
    }

    return $newElement
}

/**
 * If a country with states is the default, a select will be sent,
 * In this case we need to be able to switch to an input field and hide the required field
 *
 * @param {HTMLElement} stateElement
 */
function makeStateOptional(stateElement) {
    /* eslint-disable no-param-reassign */
    stateElement.innerHTML = `
        <input 
            type="text"
            id=${stateElement.id}
            name=${stateElement.getAttribute('name')}
            data-label=${stateElement.dataset.label}
            data-field-type=${stateElement.dataset.fieldType}
            class="js-form-input"
        />
    `

    const $newElement = q$('[data-field-type="State"]')
    if ($newElement !== null) {
        insertStateHiddenField($newElement)

        $newElement.previousElementSibling
            .querySelector('small')
            .style.display = 'none'
    }

    return $newElement
}

/**
 * Adds the array of options from the remote request to the newly created select box.
 * @param {Object} statesArray
 * @param {HTMLElement} $selectElement
 * @param {Object} options
 */
function addOptions(statesArray, $selectElement, options) {
    const container = []

    container.push(`<option value="">${statesArray.prefix}</option>`)

    if (!_.isEmpty($selectElement)) {
        statesArray.states.forEach((stateObj) => {
            if (options.useIdForStates) {
                container.push(`<option value="${stateObj.id}">${stateObj.name}</option>`)
            } else {
                container.push(
                    `<option value="${stateObj.name}">${
                        stateObj.label ? stateObj.label : stateObj.name
                    }</option>`,
                )
            }
        })

        $selectElement.innerHTML = container.join(' ')
    }
}

/**
 * @param {HTMLElement} stateElement
 * @param {Object} context
 * @param {Object} options
 * @param {Function} callback
 */
export default function (stateElement, context = {}, options, callback) {
    /**
     * Backwards compatible for three parameters instead of four
     *
     * Available options:
     *
     * useIdForStates {Bool} - Generates states dropdown using id for values instead of strings
     */
    if (typeof options === 'function') {
        /* eslint-disable no-param-reassign */
        callback = options
        options = {}
        /* eslint-enable no-param-reassign */
    }

    q$('select[data-field-type="Country"]').addEventListener('change', (event) => {
        const countryName = event.currentTarget.value

        if (countryName === '') {
            return
        }

        utils.api.country.getByName(countryName, (err, response) => {
            if (err) {
                showAlertModal(context.state_error)
                return callback(err)
            }

            const $currentInput = q$('[data-field-type="State"]')

            if (!_.isEmpty(response.data.states)) {
                // The element may have been replaced with a select, reselect it
                const $selectElement = makeStateRequired($currentInput, context)

                addOptions(response.data, $selectElement, options)
                callback(null, $selectElement)
            } else {
                const newElement = makeStateOptional($currentInput, context)

                callback(null, newElement)
            }
        })
    })
}
