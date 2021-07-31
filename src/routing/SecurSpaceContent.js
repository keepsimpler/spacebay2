import React, { useContext, useEffect, useState } from 'react'
import { Switch } from "react-router-dom"
import { StyleRoot } from 'radium'
import { AppContext } from "../context/app-context";
import { requestReadSupplierPendingBooking } from "../components/bookedSpaces/request/booked-spaces-requests";
import { AccountType, UserType } from "../components/constants/securspace-constants";
import Busy from "../components/Busy";
import ToastContainerWrapper from "../components/toast/ToastContainerWrapper";

import UserBasedNav from "./UserBasedNav";

import AccountContent from "./content-routes/AccountContent"
import AdminContent from "./content-routes/AdminContent"
import BuyerContent from "./content-routes/BuyerContent"
import GateManagementContent from "./content-routes/GateManagementContent"
import SupplierContent from "./content-routes/SupplierContent";
import ThirdPartyContent from "./content-routes/ThirdPartyContent";
import LandingContent from "./content-routes/LandingContent"
import ModalContent from "./content-routes/ModalContent";
import LoggedInAsHeader from "../components/admin/LoggedInAsHeader";
import Footer from "../components/Footer";

import 'css/secur-space-content.css'

const readSupplierPendingBooking = (user, setPendingApproval) => {
    const { id, userType, type: accountType } = user || {}
    if(id && accountType === AccountType.SUPPLIER && (userType === UserType.OWNER || userType === UserType.ADMIN)) {
        requestReadSupplierPendingBooking(id)
            .then((resp) => setPendingApproval(resp.body))
            .catch(() => {})
    }
}

const SecurSpaceContent = () => {
    const appContext = useContext(AppContext)
    const { user } = appContext

    const [pendingApprovalCount, setPendingApproval] = useState(null)

    useEffect(() => {
        readSupplierPendingBooking(user, setPendingApproval)
    }, [user])

    return (
        // todo za -- figure out what the purpose of this is?
        <StyleRoot style={{
            position: "relative",
            height: "100%",
            width: "100%"
        }}>
            <div className="secur-space-content">
                <LoggedInAsHeader />
                <UserBasedNav pendingApprovalCount={pendingApprovalCount} />
                <div className="secur-space-page-content">
                    <Switch>
                        { AccountContent() }
                        { AdminContent() }
                        { BuyerContent() }
                        { SupplierContent(() => readSupplierPendingBooking(user, setPendingApproval)) }
                        { GateManagementContent() }
                        { ThirdPartyContent() }
                        { LandingContent(() => readSupplierPendingBooking(user, setPendingApproval)) }
                    </Switch>
                </div>
                <Footer />
            </div>
            { ModalContent() }
            <ToastContainerWrapper />
            <Busy />
        </StyleRoot>
    )
}

export default SecurSpaceContent
