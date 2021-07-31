import React, { useContext } from 'react'
import { Route, useHistory } from "react-router";
import { AppContext } from "../../context/app-context";
import { withAccessControl } from "../ProtectedRoute";
import AccessControlBuilder from "../AccessControlBuilder";

import AdminReports from "../../views/AdminReports";
import AdminAccountsReport from "../../views/AdminAccountsReport";
import AdminBookingsReport from "../../views/AdminBookingsReport";
import AdminLocationsReport from "../../views/AdminLocationsReport";
import AdminInvoicesReport from "../../views/AdminInvoicesReport";
import AdminPendingCharges from "../../views/AdminPendingCharges";
import AdminReadyForPayoutReport from "../../views/AdminReadyForPayoutReport";
import AdminPayoutsReport from "../../views/AdminPayoutsReport";
import AdminBookedSpaceCalendarReport from "../../views/AdminBookedSpaceCalendarReport";
import LoginAsAccount from "../../views/LoginAsAccount";

const adminAuthorization = new AccessControlBuilder().allowAdmin().build()

const ProtectedAdminReports = withAccessControl(AdminReports, adminAuthorization)
const ProtectedAdminAccountsReport = withAccessControl(AdminAccountsReport, adminAuthorization)
const ProtectedAdminBookingsReport = withAccessControl(AdminBookingsReport, adminAuthorization)
const ProtectedAdminLocationsReport = withAccessControl(AdminLocationsReport, adminAuthorization)
const ProtectedAdminInvoicesReport = withAccessControl(AdminInvoicesReport, adminAuthorization)
const ProtectedAdminPendingCharges = withAccessControl(AdminPendingCharges, adminAuthorization)
const ProtectedAdminReadyForPayoutReport = withAccessControl(AdminReadyForPayoutReport, adminAuthorization)
const ProtectedAdminPayoutsReport = withAccessControl(AdminPayoutsReport, adminAuthorization)
const ProtectedAdminBookedSpaceCalendarReport = withAccessControl(AdminBookedSpaceCalendarReport, adminAuthorization)
const ProtectedLoginAsAccount = withAccessControl(LoginAsAccount, adminAuthorization)


const AdminContent = () => {
    const appContext = useContext(AppContext)
    const {user, updateUser, logout} = appContext

    const history = useHistory()

    const updateUserAndRedirect = (user: Object) => {
        updateUser(user, history)
    }

    return [
        <Route path="/admin-reports" key="/admin-reports">
            <ProtectedAdminReports account={user}/>
        </Route>,
        <Route path="/admin-accounts" key="/admin-accounts">
            <ProtectedAdminAccountsReport account={user} handleLogout={logout}/>
        </Route>,
        <Route path="/admin-bookings" key="/admin-bookings">
            <ProtectedAdminBookingsReport account={user} handleLogout={logout}/>
        </Route>,
        <Route path="/admin-locations" key="/admin-locations">
            <ProtectedAdminLocationsReport account={user} handleLogout={logout}/>
        </Route>,
        <Route path="/admin-invoices" key="/admin-invoices">
            <ProtectedAdminInvoicesReport account={user} handleLogout={logout}/>
        </Route>,
        <Route path="/admin-pending-charges" key="/admin-pending-charges">
            <ProtectedAdminPendingCharges account={user} handleLogout={logout}/>
        </Route>,
        <Route path="/admin-ready-for-payout" key="/admin-ready-for-payout">
            <ProtectedAdminReadyForPayoutReport account={user} handleLogout={logout}/>
        </Route>,
        <Route path="/admin-payouts" key="/admin-payouts">
            <ProtectedAdminPayoutsReport account={user} handleLogout={logout}/>
        </Route>,
        <Route path="/admin-booked-space-calendar" key="/admin-booked-space-calendar">
            <ProtectedAdminBookedSpaceCalendarReport account={user} handleLogout={logout}/>
        </Route>,
        <Route path="/login-as-account" key="/login-as-account">
            <ProtectedLoginAsAccount handleAccountChange={updateUserAndRedirect}/>
        </Route>
    ]
}

export default AdminContent
