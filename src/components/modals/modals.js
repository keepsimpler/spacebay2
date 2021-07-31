const modalClassNames = {
    className: "app-modal",
    inClassName: "app-modal-in",
    outClassName: "app-modal-out",
    backdropClassName: "app-backdrop",
    backdropInClassName: "app-backdrop-in",
    backdropOutClassName: "app-backdrop-out"
}

export const DefaultModalClassNames = modalClassNames

export const GlobalModalTypes = Object.freeze({
    SIGNUP: 'SIGNUP',
    LOGIN: 'LOGIN',
    CONFIRM_ACCOUNT: 'CONFIRM_ACCOUNT',
    FORGOT_PASSWORD: 'FORGOT_PASSWORD',
    TERMS_OF_USE: 'TERMS_OF_USE',
    PRIVACY_POLICY: 'PRIVACY_POLICY'
})
