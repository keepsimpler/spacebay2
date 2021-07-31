import React, { useContext, useState } from 'react'
import { AppContext } from "../context/app-context";
import { DEFAULT_NAV } from "./nav/DefaultNav";
import { ADMIN_NAV } from "./nav/AdminNav";
import { BUYER_OWNER_NAV, BUYER_DISPATCHER_NAV } from "./nav/BuyerNav";
import { Link } from "react-router-dom";
import NavMenu from "../views/NavMenu";
import {
    SUPPLIER_GATE_CLERK_NAV,
    makeGateManagerNav,
    SUPPLIER_OWNER_MARKETPLACE_ONLY_NAV,
    SUPPLIER_OWNER_GMS_LITE_NAV,
    SUPPLIER_OWNER_GMS_PRO_NAV,
    MARKETPLACE_ONLY_GATE_USER_NAV
} from "./nav/SupplierNav";
import {
    AccountType,
    SubscriptionType,
    UserType
} from "../components/constants/securspace-constants";

import 'css/user-based-nav.css'

const getUserBasedNavOptions = (user: { type: String, userType: String, subscriptionType: String }) => {
    const { type, userType } = user || {}

    let navOptions

    switch (type) {
        case AccountType.ADMIN:
            navOptions = ADMIN_NAV
            break
        case AccountType.BUYER:
            navOptions = getBuyerNavOptions(userType)
            break
        case AccountType.SUPPLIER:
            navOptions = getSupplierNavOptions(user)
            break
        default:
            navOptions = DEFAULT_NAV
    }

    return navOptions
}

const getSupplierNavOptions = (user: { userType: String, subscriptionType: String }) => {

    const { subscriptionType } = user || {}

    let navOptions

    switch (subscriptionType) {
        case SubscriptionType.GMS_LITE:
        case SubscriptionType.GMS_PRO:
            navOptions = getSupplierGmsSubscribersNavOptions(user)
            break
        case SubscriptionType.MARKETPLACE_ONLY:
        default:
            navOptions = getSupplierMarketplaceOnlyNavOptions(user)
    }

    return navOptions
}

const getSupplierGmsSubscribersNavOptions = (user) => {
    let navOptions

    const { subscriptionType, userType } = user || {}

    switch (userType) {
        case UserType.GATE_CLERK:
            navOptions = SUPPLIER_GATE_CLERK_NAV
            break
        case UserType.GATE_MANAGER:
            navOptions = makeGateManagerNav(user)
            break
        case UserType.OWNER:
        case UserType.ADMIN:
            navOptions = getSupplierOwnerNavOptions(subscriptionType)
            break
        default:
            navOptions = DEFAULT_NAV
    }

    return navOptions
}

const getSupplierMarketplaceOnlyNavOptions = (user) => {
    let navOptions

    const { userType } = user || {}

    switch (userType) {
        case UserType.GATE_CLERK:
        case UserType.GATE_MANAGER:
            navOptions = MARKETPLACE_ONLY_GATE_USER_NAV
            break
        case UserType.ADMIN:
        case UserType.OWNER:
        default:
            navOptions = getSupplierOwnerNavOptions(SubscriptionType.MARKETPLACE_ONLY)
    }

    return navOptions
}

const getSupplierOwnerNavOptions = (subscriptionType: String) => {
    let navOptions

    switch (subscriptionType) {
        case SubscriptionType.MARKETPLACE_ONLY:
            navOptions = SUPPLIER_OWNER_MARKETPLACE_ONLY_NAV
            break
        case SubscriptionType.GMS_LITE:
            navOptions = SUPPLIER_OWNER_GMS_LITE_NAV
            break
        case SubscriptionType.GMS_PRO:
            navOptions = SUPPLIER_OWNER_GMS_PRO_NAV
            break
        default:
            navOptions = DEFAULT_NAV
    }

    return navOptions
}

const getBuyerNavOptions = (userType: String) => {
    if(userType === UserType.OWNER || userType === UserType.ADMIN) {
        return BUYER_OWNER_NAV
    } else {
        return BUYER_DISPATCHER_NAV
    }
}

const UserBasedNav = ({ pendingApprovalCount }) => {
    const context = useContext(AppContext)
    const { user, clearUser } = context
    const [showMenu, setShowMenu] = useState(false)

    const navOptions = getUserBasedNavOptions(user)

    return (
        <div id="appNav" className="user-based-nav-container">
            <div>
                <Link id="navLogoContainer" to="/">
                    <img id="navLogoTrans"
                         src="app-images/logo/envase_secur_space_logo_color.png"
                         alt="SecūrSpace"/>
                </Link>

                <div id="navMenuContainer">
                    <div id="toggleMenuIcon" onClick={() => setShowMenu(true)}/>
                    <NavMenu navMenu={navOptions}
                             handleLogout={clearUser}
                             showMenu={showMenu}
                             closeNavMenu={() => setShowMenu(false)}
                             pendingApprovalCount={pendingApprovalCount}
                    />
                </div>
            </div>

        </div>
    )
}

export default UserBasedNav
