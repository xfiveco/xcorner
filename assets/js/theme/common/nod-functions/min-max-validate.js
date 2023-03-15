import q$ from '../../global/selector'

function minMaxValidate(minInputSelector, maxInputSelector) {
    function validate(cb) {
        const minValue = parseFloat(q$(minInputSelector).value)
        const maxValue = parseFloat(q$(maxInputSelector).value)

        if (maxValue > minValue || Number.isNaN(maxValue) || Number.isNaN(minValue)) {
            return cb(true)
        }

        return cb(false)
    }

    return validate
}

export default minMaxValidate
