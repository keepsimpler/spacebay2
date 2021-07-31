import React, { useState } from 'react'
import { BrowserRouter as Router } from "react-router-dom";
import { SocialLoginContext } from "../context/social-login-context";
import SecurSpaceContent from "./SecurSpaceContent";
import GlobalModalManager from "../components/modals/GlobalModalManager";

const SecurSpaceRouter = (props) => {
    const [socialLogin, setSocialLogin] = useState({user: null})

    const contextValue = {
        socialLogin,
        setSocialLoginUser: (user) => setSocialLogin({user: user }),
        clearSocialLoginUser: () => setSocialLogin({user: null})
    }

    return (
        <SocialLoginContext.Provider value={contextValue}>
            <Router>
                <GlobalModalManager>
                    <SecurSpaceContent />
                </GlobalModalManager>
            </Router>
        </SocialLoginContext.Provider>
    )
}

export default SecurSpaceRouter
