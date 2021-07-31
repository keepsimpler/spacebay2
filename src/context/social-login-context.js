import React from 'react'

const internalContext = React.createContext({
    socialLogin: { user: null },
    setSocialLoginUser: (user: Object) : void => {},
    clearSocialLoginUser: () : void => {}
})

internalContext.displayName = "SecurSpaceSocialLoginContext"

export const SocialLoginContext = internalContext
