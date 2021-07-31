import React, {useContext} from 'react'
import {Route} from "react-router";
import {AppContext} from "../../context/app-context";
import {withAccessControl} from "../ProtectedRoute";
import AccessControlBuilder from "../AccessControlBuilder";

import SupplierActiveBookings from "../../views/SupplierActiveBookings";
import SupplierInventoryReport from "../../views/SupplierInventoryReport";
import SupplierInterchangeReport from "../../views/SupplierInterchangeReport";
import SupplierActivitySummaryReport from "../../views/SupplierActivitySummaryReport";

const allSupplierGmsAuthorization = new AccessControlBuilder().allowAllGmsUsers().build()

const ProtectedSupplierActiveBookings = withAccessControl(SupplierActiveBookings, allSupplierGmsAuthorization)
const ProtectedSupplierInventoryReport = withAccessControl(SupplierInventoryReport, allSupplierGmsAuthorization)
const ProtectedSupplierInterchangeReport = withAccessControl(SupplierInterchangeReport, allSupplierGmsAuthorization)
const ProtectedSupplierActivitySummaryReport = withAccessControl(SupplierActivitySummaryReport, allSupplierGmsAuthorization)

const GateManagementContent = () => {
    const appContext = useContext(AppContext)
    const {user, logout} = appContext

    return [
        <Route path="/check-in" key="/check-in">
            <ProtectedSupplierActiveBookings account={user} handleLogout={logout}/>
        </Route>,
        <Route path="/supplier-inventory" key="/supplier-inventory">
            <ProtectedSupplierInventoryReport account={user} handleLogout={logout}/>
        </Route>,
        <Route path="/supplier-interchanges" key="/supplier-interchanges">
            <ProtectedSupplierInterchangeReport account={user} handleLogout={logout}/>
        </Route>,
        <Route path="/supplier-activity-summary" key="/supplier-activity-summary">
            <ProtectedSupplierActivitySummaryReport account={user} handleLogout={logout}/>
        </Route>
    ]
}

export default GateManagementContent
