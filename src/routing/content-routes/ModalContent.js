import React, { useContext } from 'react'
import { AppContext } from "../../context/app-context";
import { ModalRoute } from 'react-router-modal'
import { useHistory } from "react-router-dom";
import { getLandingRedirectPathForUser } from "../route-utils";

import ContextualSignUp from "../../components/modals/context-wrappers/ContextualSignUp";
import ContextualLogin from "../../components/modals/context-wrappers/ContextualLogin";
import ContextualAccountConfirmation from "../../components/modals/context-wrappers/ContextualAccountConfirmation";
import ContextualForgotPassword from "../../components/modals/context-wrappers/ContextualForgotPassword";
import ContextualDynamicPage from "../../components/modals/context-wrappers/ContextualDynamicPage";
import { DefaultModalClassNames } from "../../components/modals/modals";

const ModalContent = () => {

    const appContext = useContext(AppContext)
    const { user } = appContext
    const history = useHistory()

    const globalCancel = () => history.push(getLandingRedirectPathForUser(user))

    return [
        <ModalRoute path="/signup"
                    parentPath={getLandingRedirectPathForUser(user)}
                    key="modal_/signup"
                    { ...DefaultModalClassNames }>
            <ContextualSignUp
                cancel={globalCancel}
                handleNavigateToSignup={() => history.push("/signup")}
                handleNavigateToLogin={() => history.push("/login")}
            />
        </ModalRoute>,
        <ModalRoute path="/login"
                    parentPath={getLandingRedirectPathForUser(user)}
                    key="modal_/login"
                    { ...DefaultModalClassNames }>
            <ContextualLogin
                cancel={globalCancel}
                handleForgotPasswordNavigation={() => history.push("/forgot-password")}
                handleSignUpNavigation={() => history.push("/signup")}
            />
        </ModalRoute>,
        <ModalRoute path="/confirm-account"
                    parentPath="/"
                    key="modal_/confirm_account"
                    onBackdropClick={() => {}}
                    { ...DefaultModalClassNames }>
            <ContextualAccountConfirmation />
        </ModalRoute>,
        <ModalRoute path="/forgot-password"
                    parentPath={getLandingRedirectPathForUser(user)}
                    key="modal_/forgot-password"
                    { ...DefaultModalClassNames }>
            <ContextualForgotPassword cancel={globalCancel} />
        </ModalRoute>,
        <ModalRoute path="/terms-of-use/:version?"
                    parentPath="/" key="modal_/terms_of_user"
                    { ...DefaultModalClassNames }
                    className="app-modal modal-page">
            <ContextualDynamicPage type="terms" cancel={globalCancel} />
        </ModalRoute>,
        <ModalRoute path="/privacy-policy/:version?"
                    parentPath="/" key="modal_/privacy-policy"
                    { ...DefaultModalClassNames }
                    className="app-modal modal-page">
            <ContextualDynamicPage type="privacy-policy" cancel={globalCancel} />
        </ModalRoute>
    ]
}


export default ModalContent
