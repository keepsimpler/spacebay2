import React, { useContext} from 'react'
import { Route } from "react-router-dom";
import { AppContext } from "../../context/app-context";
import { withAccessControl } from "../ProtectedRoute";
import AccessControlBuilder from "../AccessControlBuilder";

import CompanyProfile from "../../views/CompanyProfile";
import LocationsProfile from "../../views/LocationsProfile";
import ManageUsers from "../../views/ManageUsers";
import NotificationsSettings from "../../views/NotificationsSettings";
import ExternalMySubscriptionsView from "../../views/account/ExternalMySubscriptionsView";

const allOwnerAuthorization = new AccessControlBuilder().allowAllOwners().build()
const allSupplierOwnerAuthorization = new AccessControlBuilder().allowAllSupplierOwner().build()
const gateManagerAuthorization = new AccessControlBuilder().allowGateManager().build()

const ProtectedCompanyProfile = withAccessControl(CompanyProfile, allOwnerAuthorization)
const ProtectedLocationsProfile = withAccessControl(LocationsProfile, allSupplierOwnerAuthorization, gateManagerAuthorization)
const ProtectedManageUsers = withAccessControl(ManageUsers, allOwnerAuthorization)
const ProtectedNotificationSettings = withAccessControl(NotificationsSettings, allOwnerAuthorization)
const ProtectedExternalSubscriptions = withAccessControl(ExternalMySubscriptionsView, allSupplierOwnerAuthorization)

const AccountContent = () => {
    const appContext = useContext(AppContext)
    const {user, updateUser, logout} = appContext

    return [
            <Route path="/company-profile" key="/company-profile">
                <ProtectedCompanyProfile account={user} handleLogout={logout} handleAccountUpdated={updateUser} />
            </Route>,
            <Route path="/locations-profile" key="/locations-profile">
                <ProtectedLocationsProfile account={user} handleLogout={logout} />
            </Route>,
            <Route path="/user-management" key="/user-management">
                <ProtectedManageUsers account={user} handleLogout={logout} />
            </Route>,
            <Route path="/notification-settings" key="/notification-settings">
                <ProtectedNotificationSettings account={user} handleLogout={logout} />
            </Route>,
            <Route path="/my-subscriptions" key="/my-subscriptions">
                <ProtectedExternalSubscriptions />
            </Route>
     ]
}

export default AccountContent;
