import React from 'react'

const internalContext = React.createContext({
    user: undefined,
    loadingUserDetails: false,
    // eslint-disable-next-line
    updateUser: (user: Object, history?: { push: (path: String) => void }) : void => {},
    clearUser: () : void => {},
    logout: (sessionTimedOut?: boolean) : void => {}
})

internalContext.displayName = "SecurSpaceAppContext"

export const AppContext = internalContext;
