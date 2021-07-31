import React, { useContext } from 'react'
import { useHistory } from "react-router";
import { AppContext } from "../../../context/app-context";
import { SocialLoginContext } from "../../../context/social-login-context";
import { Redirect } from "react-router";
import { getLandingRedirectPathForUser } from "../../../routing/route-utils";
import SessionPoller from "../../../services/session/SessionPoller";
import Login from "../../../views/Login";
import PropTypes from 'prop-types'


const ContextualLogin = (props) => {
    const appContext = useContext(AppContext)
    const { user, loadingUserDetails, updateUser } = appContext

    const socialLoginContext = useContext(SocialLoginContext)
    const { setSocialLoginUser, clearSocialLoginUser } = socialLoginContext

    const history = useHistory()

    const redirectPath = getLandingRedirectPathForUser(user)

    const updateUserAndRedirect = (user: Object) => {
        updateUser(user, history)
        SessionPoller.beginPolling(() => {
            updateUser(undefined)
            history.push("/login?timeout=true")
        })
    }

    let content

    if(loadingUserDetails) {
        content = <div /> // todo za -- loading component
    } else if(user && user.id) {
        content = <Redirect to={redirectPath} />
    } else {
        content = <Login
            { ...props }
            account={user}
            handleAccountChange={updateUserAndRedirect}
            setSocialLoginUser={setSocialLoginUser}
            clearSocialLoginUser={clearSocialLoginUser}
        />
    }

    return content
}

ContextualLogin.propTypes = {
    cancel: PropTypes.func.isRequired,
    handleForgotPasswordNavigation: PropTypes.func.isRequired,
    handleSignUpNavigation: PropTypes.func.isRequired,
    thirdPartyId: PropTypes.number
}

export default ContextualLogin
