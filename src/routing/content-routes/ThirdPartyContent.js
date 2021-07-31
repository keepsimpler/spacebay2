import React, { useContext } from 'react'
import { Route } from "react-router";
import { AppContext } from "../../context/app-context";
import { withAccessControl } from "../ProtectedRoute";
import AccessControlBuilder from "../AccessControlBuilder";

import ThirdPartyAccountDetails from "../../views/ThirdPartyAccountDetails";

const thirdPartyAdminAuthorization = new AccessControlBuilder().allowThirdPartyAdmins().build()

const ProtectedThirdPartyAccountDetails = withAccessControl(ThirdPartyAccountDetails, thirdPartyAdminAuthorization)

const ThirdPartyContent = () => {
    const appContext = useContext(AppContext)
    const { user } = appContext
    return [
        <Route path="/partner-details" key="/partner-details">
            <ProtectedThirdPartyAccountDetails thirdPartyUser={user} />
        </Route>
    ]
}

export default ThirdPartyContent
