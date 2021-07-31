import React, { useContext } from 'react'
import { AppContext } from "../../../context/app-context";
import { Redirect } from "react-router";
import { getLandingRedirectPathForUser } from "../../../routing/route-utils";
import ForgotPassword from "../../../views/ForgotPassword";
import PropTypes from 'prop-types'


const ContextualForgotPassword = (props) => {
    const appContext = useContext(AppContext)
    const { user, loadingUserDetails } = appContext

    let content

    if(loadingUserDetails) {
        content = <div /> // todo za -- loading component
    } else if(user && user.id) {
        content = <Redirect to={getLandingRedirectPathForUser(user)} />
    } else {
        content = <ForgotPassword
            {...props}
        />
    }

    return content
}

ContextualForgotPassword.propTypes = {
    cancel: PropTypes.func.isRequired
}

export default ContextualForgotPassword
