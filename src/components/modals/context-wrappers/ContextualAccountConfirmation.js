import React, { useContext } from 'react'
import { AppContext } from "../../../context/app-context";
import { Redirect } from "react-router";
import { useHistory } from "react-router";
import { getLandingRedirectPathForUser } from "../../../routing/route-utils";
import AccountConfirmation from "../../../views/AccountConfirmation";
import AccountUtilService from "../../../services/account/AccountUtilService";
import { requestLoggedInAuthoritySource } from "../../../services/session/session-requests";

const handleAccountConfirmation = (updateUser, history) => {
    requestLoggedInAuthoritySource()
        .then((resp) => {
            updateUser(resp.body, history)
        })
        .catch(() => history.push("/confirm-account"))
}

const ContextualAccountConfirmation = (props) => {
    const appContext = useContext(AppContext)
    const { user, updateUser, loadingUserDetails } = appContext

    const history = useHistory()

    let content

    if(loadingUserDetails) {
        content = <div /> // todo za -- loading component
    } else if(AccountUtilService.userNeedsTosConfirmation(user)) {
        content = <AccountConfirmation
            {...props}
            account={user}
            onAccountConfirmation={() => handleAccountConfirmation(updateUser, history)}
        />
    } else {
        content = <Redirect to={getLandingRedirectPathForUser(user)} />
    }

    return content
}

export default ContextualAccountConfirmation
