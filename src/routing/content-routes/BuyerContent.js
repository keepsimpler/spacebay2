import React, { useContext } from 'react'
import { Route } from "react-router";
import { AppContext } from "../../context/app-context";
import { withAccessControl } from "../ProtectedRoute";
import AccessControlBuilder from "../AccessControlBuilder";

import BookedSpaces from "../../views/BookedSpaces";
import BuyerInventoryReport from "../../views/BuyerInventoryReport";
import BuyerInterchangeReport from "../../views/BuyerInterchangeReport";
import BuyerInvoicesReport from "../../views/BuyerInvoicesReport";
import BuyerBookedSpaceCalendarReport from "../../views/BuyerBookedSpaceCalendarReport";

const buyerOwnerAuthorization = new AccessControlBuilder().allowBuyerOwner().build()
const allBuyerAuthorization = new AccessControlBuilder().allowAllBuyer().build()

const ProtectedBookedSpaces = withAccessControl(BookedSpaces, buyerOwnerAuthorization)
const ProtectedBuyerInventoryReport = withAccessControl(BuyerInventoryReport, allBuyerAuthorization)
const ProtectedBuyerInterchangeReport = withAccessControl(BuyerInterchangeReport, allBuyerAuthorization)
const ProtectedBuyerInvoicesReport = withAccessControl(BuyerInvoicesReport, allBuyerAuthorization)
const ProtectedBuyerBookedSpaceCalendarReport = withAccessControl(BuyerBookedSpaceCalendarReport, buyerOwnerAuthorization)

const BuyerContent = () => {

    const appContext = useContext(AppContext)
    const { user, logout } = appContext

    return [
        <Route path="/my-bookings" key="/my-bookings">
            <ProtectedBookedSpaces account={user} handleLogout={logout} />
        </Route>,
        <Route path="/buyer-inventory" key="/buyer-inventory">
            <ProtectedBuyerInventoryReport account={user} handleLogout={logout} />
        </Route>,
        <Route path="/buyer-interchanges" key="/buyer-interchanges">
            <ProtectedBuyerInterchangeReport account={user} handleLogout={logout} />
        </Route>,
        <Route path="/buyer-invoices" key="/buyer-invoices">
            <ProtectedBuyerInvoicesReport account={user} handleLogout={logout} />
        </Route>,
        <Route path="/buyer-booked-space-calendar" key="/buyer-booked-space-calendar">
            <ProtectedBuyerBookedSpaceCalendarReport account={user} handleLogout={logout} />
        </Route>
    ]
}

export default BuyerContent
