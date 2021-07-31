import React from 'react'

const internalContext = React.createContext({
    showLoginModal: (stack: number) : void => {},
    closeLoginModal: () : void => {},
    showSignUpModal: (stack: number) : void => {},
    closeSignUpModal: () : void => {},
    showForgotPasswordModal: (stack: number) : void => {},
    closeForgotPasswordModal: () : void => {},
    showTermsModal: (stack: number) : void => {},
    closeTermsModal: () : void => {},
    showPrivacyModal: (stack: number) : void => {},
    closePrivacyModal: () : void => {},
    showVersionedTermsModal: (version: number, stack: number) => {},
    closeVersionedTermsModal: () => {},
    showVersionedPrivacyModal: (version: number, stack: number) => {},
    closeVersionedPrivacyModal: () => {}
})

internalContext.displayName = "SecurSpaceGlobalModalContext"

export const GlobalModalContext = internalContext
