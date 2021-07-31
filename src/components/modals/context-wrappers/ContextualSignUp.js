import React, { useContext } from 'react'
import { useLocation, useHistory } from "react-router";
import { AppContext } from "../../../context/app-context";
import { SocialLoginContext } from "../../../context/social-login-context";
import { Redirect } from "react-router";
import { getLandingRedirectPathForUser } from "../../../routing/route-utils";
import SignUp from "../../../views/SignUp";
import PropTypes from 'prop-types'

const ContextualSignUp = (props) => {
    const appContext = useContext(AppContext)
    const { user, loadingUserDetails, updateUser } = appContext

    const socialLoginContext = useContext(SocialLoginContext)
    const { socialLogin, setSocialLoginUser, clearSocialLoginUser } = socialLoginContext

    const location = useLocation()
    const history = useHistory()

    const redirectPath = getLandingRedirectPathForUser(user)

    const updateUserAndRedirect = (user: Object) => {
        updateUser(user, history)
    }

    let content

    if(loadingUserDetails) {
        content = <div /> //todo za -- loading component
    } else if(user && user.id) {
        content = <Redirect to={redirectPath} />
    } else {
        content = <SignUp
            {...props}
            handleAccountChange={updateUserAndRedirect}
            socialLoginTemporaryUser={socialLogin}
            setSocialLoginUser={setSocialLoginUser}
            clearSocialLoginUser={clearSocialLoginUser}
            location={location}
        />
    }

    return content
}

ContextualSignUp.propTypes = {
    handleNavigateToLogin: PropTypes.func.isRequired,
    handleNavigateToSignup: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired,
    thirdPartyId: PropTypes.string
}

export default ContextualSignUp
