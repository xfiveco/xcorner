/**
 * This function parses HTML entities in strings
 * @param {string} str
 * @returns {string}
*/
export const safeString = (str) => {
    const d = new DOMParser();

    return d.parseFromString(str, 'text/html').body.textContent;
};
