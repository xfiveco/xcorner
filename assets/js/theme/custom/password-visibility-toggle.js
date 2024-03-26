export default function passwordVisibilityToggle() {
    const passwordInput = document.querySelector('.js-password-input')
    const passwordToggle = document.querySelector('.js-toggle-password')

    if (!passwordInput || !passwordToggle) {
        return
    }

    passwordToggle.addEventListener('click', () => {
        /* eslint-disable no-unused-expressions */
        passwordInput.type === 'password' ? (passwordInput.type = 'text') : (passwordInput.type = 'password')
    })
}
