import { createTranslationDictionary } from './utils/translations-utils'
import { q$$ } from '../global/selector'

/**
 * Validate that the given date for the day/month/year select inputs is within potential range
 * @param {HTMLElement} $formField
 * @param {String} validation
 * @returns {{selector: string, triggeredBy: string, validate: Function, errorMessage: string}}
 */
function buildDateValidation($formField, validation, requiredMessage) {
    // No date range restriction, skip
    if (validation.min_date && validation.max_date) {
        const invalidMessage = `Your chosen date must fall between ${validation.min_date} and ${validation.max_date}.`
        const formElementId = $formField.id
        const minSplit = validation.min_date.split('-')
        const maxSplit = validation.max_date.split('-')
        const minDate = new Date(minSplit[0], minSplit[1] - 1, minSplit[2])
        const maxDate = new Date(maxSplit[0], maxSplit[1] - 1, maxSplit[2])

        return {
            selector: `#${formElementId} select[data-label="year"]`,
            triggeredBy: `#${formElementId} select:not([data-label="year"])`,
            validate: (cb, val) => {
                const day = Number($formField.querySelector('select[data-label="day"]').value)
                const month = Number($formField.querySelector('select[data-label="month"]').value) - 1
                const year = Number(val)
                const chosenDate = new Date(year, month, day)

                cb(chosenDate >= minDate && chosenDate <= maxDate)
            },
            errorMessage: invalidMessage,
        }
    }
    // Required Empty Date field
    if (validation.required && (!validation.min_date || !validation.max_date)) {
        const formElementId = $formField.id

        return {
            selector: `#${formElementId} select[data-label="year"]`,
            triggeredBy: `#${formElementId} select:not([data-label="year"])`,
            validate: (cb, val) => {
                const day = $formField.querySelector('select[data-label="day"]').value
                const month = $formField.querySelector('select[data-label="month"]').value
                const year = val

                cb(day && month && year)
            },
            errorMessage: requiredMessage,
        }
    }
}

/**
 * We validate checkboxes separately from single input fields, as they must have at least one checked option
 * from many different inputs
 * @param {HTMLElement} $formField
 * @param {String} validation
 * @param {String} errorText provides error validation message
 * @returns {object}
 */
function buildRequiredCheckboxValidation(validation, $formField, errorText) {
    const formFieldId = $formField.id
    const primarySelector = `#${formFieldId} input:first-of-type`
    const secondarySelector = `#${formFieldId} input`

    return {
        selector: primarySelector,
        triggeredBy: secondarySelector,
        validate: (cb) => {
            let result = false

            q$$(secondarySelector).forEach((checkbox) => {
                if (checkbox.checked) {
                    result = true

                    return false
                }
            })

            cb(result)
        },
        errorMessage: errorText,
    }
}

/**
 * @param {string} validation
 * @param {string} selector
 * @param {string} errorText
 * @returns {object}
 */
function buildRequiredValidation(validation, selector, errorText) {
    return {
        selector,
        validate(cb, val) {
            cb(val.length > 0)
        },
        errorMessage: errorText,
    }
}

/**
 * @param {string} validation
 * @param {string} formFieldSelector
 * @returns {object}
 */
function buildNumberRangeValidation(validation, formFieldSelector) {
    const invalidMessage = `The value for ${validation.label} must be between ${validation.min} and ${validation.max}.`
    const min = Number(validation.min)
    const max = Number(validation.max)

    return {
        selector: `${formFieldSelector} input[name="${validation.name}"]`,
        validate: (cb, val) => {
            const numberVal = Number(val)

            cb(numberVal >= min && numberVal <= max)
        },
        errorMessage: invalidMessage,
    }
}

/**
 * @param {HTMLElement} $validateableElement
 * @param {string} errorMessage
 * @returns {Array<object>}
 */
function buildValidation($validateableElement, errorMessage) {
    const validation = $validateableElement.dataset.validation
    const fieldValidations = []
    const formFieldSelector = `#${$validateableElement.id}`

    if (validation.type === 'datechooser') {
        const dateValidation = buildDateValidation($validateableElement, validation, errorMessage)

        if (dateValidation) {
            fieldValidations.push(dateValidation)
        }
    } else if (validation.required && (validation.type === 'checkboxselect' || validation.type === 'radioselect')) {
        fieldValidations.push(buildRequiredCheckboxValidation(validation, $validateableElement, errorMessage))
    } else {
        /* eslint-disable no-inner-declarations */
        function handleElements($element) {
            const $inputElement = $element
            const tagName = $inputElement.tagName
            const inputName = $inputElement.name
            const elementSelector = `${formFieldSelector} ${tagName}[name="${inputName}"]`

            if (validation.type === 'numberonly') {
                fieldValidations.push(buildNumberRangeValidation(validation, formFieldSelector))
            }
            if (validation.required) {
                fieldValidations.push(buildRequiredValidation(validation, elementSelector, errorMessage))
            }
        }

        q$$('input', $validateableElement).forEach(handleElements)
        q$$('select', $validateableElement).forEach(handleElements)
        q$$('textarea', $validateableElement).forEach(handleElements)
    }

    return fieldValidations
}

/**
 * Builds the validation model for dynamic forms
 * @param {HTMLElement} $form
 * @param {object} context provides access for error messages on required fields validation
 * @returns {Array<object>}
 */
export default function buildModel($form, context) {
    let validationsToPerform = []
    const { field_not_blank: requiredFieldValidationText } = createTranslationDictionary(context)

    q$$('[data-validation]', $form).forEach(($input) => {
        const getLabel = ($el) => $el.dataset.validation.label
        const requiredValidationMessage = getLabel($input) + requiredFieldValidationText

        validationsToPerform = validationsToPerform.concat(buildValidation($input, requiredValidationMessage))
    })

    return validationsToPerform
}
