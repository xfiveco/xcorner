/**
 * @export
 * @param {string} cert
 * @returns {Boolean}
 */
export default function checkCert(cert) {
    if (typeof cert !== 'string' || cert.length === 0) {
        return false
    }

    // Add any custom gift certificate validation logic here
    return true
}
