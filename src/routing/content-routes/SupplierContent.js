import React, { useContext } from 'react'
import { Route } from "react-router"
import { withAccessControl } from "../ProtectedRoute";
import { UserType, AccountType, SubscriptionType } from "../../components/constants/securspace-constants";
import AccessControlBuilder from "../AccessControlBuilder";

import Approvals from "../../views/Approvals";
import SupplierBookingsReport from "../../views/SupplierBookingsReport";
import SupplierInvoicesReport from "../../views/SupplierInvoicesReport";
import SupplierReadyForPayoutReport from "../../views/SupplierReadyForPayoutReport";
import SupplierPayoutsReport from "../../views/SupplierPayoutsReport";
import SupplierBookedSpaceCalendarReport from "../../views/SupplierBookedSpaceCalendarReport";
import GmsUpgrade from "../../components/gms/GmsUpgrade";
import {AppContext} from "../../context/app-context";

const allSupplierOwnerAuthorization = new AccessControlBuilder().allowAllSupplierOwner().build()
const gateManagerAuthorization = new AccessControlBuilder().allowGateManager().build()
const gmsProOwnerAuthorization = new AccessControlBuilder().allowGmsProOwner().build()

const canGateManagersViewSupplierBookings = (user : { allowsGateManagersToViewBookings: boolean}) => {
    return user && user.allowsGateManagersToViewBookings
}

const modifiedGateManagerAuthorization = {
    ...gateManagerAuthorization,
    additionalValidation: canGateManagersViewSupplierBookings
}

const gmsUpgradeAuthorization = new AccessControlBuilder()
    .allowAccountType(AccountType.SUPPLIER)
    .allowUserType(UserType.GATE_CLERK)
    .allowUserType(UserType.GATE_MANAGER)
    .allowSubscriptionType(SubscriptionType.MARKETPLACE_ONLY)
    .build()

const ProtectedApprovals = withAccessControl(Approvals, allSupplierOwnerAuthorization, gateManagerAuthorization)
const ProtectedSupplierBookingsReport = withAccessControl(SupplierBookingsReport, allSupplierOwnerAuthorization, modifiedGateManagerAuthorization)
const ProtectedSupplierInvoicesReport = withAccessControl(SupplierInvoicesReport, allSupplierOwnerAuthorization)
const ProtectedSupplierReadyForPayoutReport = withAccessControl(SupplierReadyForPayoutReport, allSupplierOwnerAuthorization)
const ProtectedSupplierPayoutsReport = withAccessControl(SupplierPayoutsReport, allSupplierOwnerAuthorization)
const ProtectedSupplierBookedSpaceCalendarReport = withAccessControl(SupplierBookedSpaceCalendarReport, gmsProOwnerAuthorization)
const ProtectedGmsUpgrade = withAccessControl(GmsUpgrade, gmsUpgradeAuthorization)

const SupplierContent = (readSupplierPendingBooking) => {

    const appContext = useContext(AppContext)
    const { user, logout } = appContext

    return [
        <Route path="/approvals" key="/approvals">
            <ProtectedApprovals account={user} handleLogout={logout} readPendingBooking={readSupplierPendingBooking} />
        </Route>,
        <Route path="/supplier-bookings" key="/supplier-bookings">
            <ProtectedSupplierBookingsReport account={user} handleLogout={logout} />
        </Route>,
        <Route path="/supplier-invoices" key="/supplier-invoices">
            <ProtectedSupplierInvoicesReport account={user} handleLogout={logout} />
        </Route>,
        <Route path="/ready-for-payout" key="/ready-for-payout">
            <ProtectedSupplierReadyForPayoutReport account={user} handleLogout={logout} />
        </Route>,
        <Route path="/supplier-payouts" key="/supplier-payouts">
            <ProtectedSupplierPayoutsReport account={user} handleLogout={logout} />
        </Route>,
        <Route path="/supplier-booked-space-calendar" key="/supplier-booked-space-calendar">
            <ProtectedSupplierBookedSpaceCalendarReport account={user} handleLogout={logout} />
        </Route>,
        <Route path="/gms-upgrade" key="/gms-upgrade">
            <ProtectedGmsUpgrade />
        </Route>
    ]
}

export default SupplierContent
