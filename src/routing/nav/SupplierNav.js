import {
    LandingNav,
    SupplierNav,
    GateManagementNav,
    AccountNav,
    MarketplaceOnlyGmsUserNav
} from "./navs";

const GATE_MANAGEMENT_SUBNAV = {
    path: 'gate-management', label: 'GATE MANAGEMENT', submenuWidth: 180,
    submenus: [
        GateManagementNav.CHECK_IN,
        GateManagementNav.SUPPLIER_INVENTORY,
        GateManagementNav.SUPPLIER_INTERCHANGES,
        GateManagementNav.SUPPLIER_ACTIVITY_SUMMARY
    ]
}

const FINANCES_SUBNAV = {
    path: 'finances', label: 'FINANCES', submenuWidth: 170,
    submenus: [
        SupplierNav.SUPPLIER_INVOICES,
        SupplierNav.READY_FOR_PAYOUT,
        SupplierNav.SUPPLIER_PAYOUTS
    ]
}

const ACCOUNT_SUBNAV = {
    path: 'account', label: 'ACCOUNT', submenuWidth: 170,
    submenus: [
        AccountNav.COMPANY_PROFILE,
        AccountNav.LOCATIONS_PROFILE,
        AccountNav.USER_MANAGEMENT,
        AccountNav.NOTIFICATIONS_SETTINGS,
        AccountNav.MY_SUBSCRIPTIONS,
        AccountNav.SIGN_OUT
    ]
}

const makeBookingsSubmenu = (...additionalItems) => {

    const subMenus = Array.prototype.concat([
        SupplierNav.APPROVALS,
        SupplierNav.SUPPLIER_BOOKINGS
    ], additionalItems)

    return {
        path: 'bookings',
        label: 'BOOKINGS',
        submenuWidth: 220,
        badge: true,
        submenus: subMenus
    }
}

export const SUPPLIER_OWNER_GMS_LITE_NAV = [
    LandingNav.SEARCH,
    GATE_MANAGEMENT_SUBNAV,
    makeBookingsSubmenu(),
    FINANCES_SUBNAV,
    ACCOUNT_SUBNAV
]


export const SUPPLIER_OWNER_GMS_PRO_NAV = [
    LandingNav.SEARCH,
    GATE_MANAGEMENT_SUBNAV,
    makeBookingsSubmenu(SupplierNav.SUPPLIER_BOOKED_SPACE_CALENDAR),
    FINANCES_SUBNAV,
    ACCOUNT_SUBNAV
]

export const SUPPLIER_OWNER_MARKETPLACE_ONLY_NAV = [
    LandingNav.SEARCH,
    SupplierNav.GMS_LANDING,
    makeBookingsSubmenu(),
    FINANCES_SUBNAV,
    ACCOUNT_SUBNAV
]

export const makeGateManagerNav = (user: { allowsGateManagersToViewBookings: boolean }) => {
    const nav = [
        GateManagementNav.CHECK_IN,
        GateManagementNav.SUPPLIER_INVENTORY,
        GateManagementNav.SUPPLIER_INTERCHANGES,
        GateManagementNav.SUPPLIER_ACTIVITY_SUMMARY,
        SupplierNav.APPROVALS
    ]

    if(user.allowsGateManagersToViewBookings) {
        nav.push(SupplierNav.SUPPLIER_BOOKINGS)
    }

    Array.prototype.push.apply(nav, [AccountNav.LOCATIONS_PROFILE, AccountNav.SIGN_OUT])

    return nav
}

export const SUPPLIER_GATE_CLERK_NAV = [
    GateManagementNav.CHECK_IN,
    GateManagementNav.SUPPLIER_INVENTORY,
    GateManagementNav.SUPPLIER_INTERCHANGES,
    GateManagementNav.SUPPLIER_ACTIVITY_SUMMARY,
    AccountNav.SIGN_OUT
]

export const MARKETPLACE_ONLY_GATE_USER_NAV = [
    MarketplaceOnlyGmsUserNav.GMS_UPGRADE,
    SupplierNav.GMS_LANDING,
    LandingNav.CONTACT,
    AccountNav.SIGN_OUT
]
