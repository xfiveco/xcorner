/**
 * This function removes any empty string values from the formData
 * @param formData: FormData object
 * @returns FormData object
 */
export const filterEmptyValuesFromForm = (formData) => {
    const filteredForm = Array.from(formData.entries()).filter(([, value]) => value !== '')
    const res = new FormData()

    try {
        for (const [key, val] of filteredForm) {
            res.append(key, val)
        }
    } catch (e) {
        console.log(e) // eslint-disable-line no-console
    }

    return res
}

/**
 * https://stackoverflow.com/questions/49672992/ajax-request-fails-when-sending-formdata-including-empty-file-input-in-safari
 * Safari browser. This function removes any empty files from the form params
 * @param formData: FormData object
 * @returns FormData object
 */
export const filterEmptyFilesFromForm = (formData) => {
    const res = new FormData()

    try {
        for (const [key, val] of formData) {
            if (!(val instanceof File) || val.name || val.size) {
                res.append(key, val)
            }
        }
    } catch (e) {
        console.error(e) // eslint-disable-line no-console
    }

    return res
}

/**
 * This function removes empty string values and empty files from the formData
 * @param formData: FormData object
 * @returns FormData object
 */
export const normalizeFormData = (formData) => filterEmptyValuesFromForm(filterEmptyFilesFromForm(formData))
