import { LandingNav, BuyerNav, AccountNav } from "./navs";

export const BUYER_OWNER_NAV = [
    LandingNav.SEARCH,
    LandingNav.HOW_IT_WORKS,
    BuyerNav.MY_BOOKINGS,
    {
        path: 'reports', label: 'REPORTS', submenuWidth: 236,
        submenus: [
            BuyerNav.BUYER_INVENTORY,
            BuyerNav.BUYER_INTERCHANGES,
            BuyerNav.BUYER_INVOICES,
            BuyerNav.BUYER_BOOKED_SPACE_CALENDAR
        ]
    },
    LandingNav.CONTACT,
    {
        path: 'account', label: 'ACCOUNT', submenuWidth: 152,
        submenus: [
            AccountNav.COMPANY_PROFILE,
            AccountNav.USER_MANAGEMENT,
            AccountNav.NOTIFICATIONS_SETTINGS,
            AccountNav.SIGN_OUT
        ]
    }
]

export const BUYER_DISPATCHER_NAV = [
    LandingNav.SEARCH,
    BuyerNav.BUYER_INTERCHANGES,
    BuyerNav.BUYER_INVENTORY,
    BuyerNav.BUYER_INVOICES,
    AccountNav.SIGN_OUT
]
