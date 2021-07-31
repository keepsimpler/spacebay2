import { LandingNav, AdminNav, AccountNav} from "./navs";

export const ADMIN_NAV = [
    LandingNav.SEARCH,
    {
        path: 'reports', label: 'REPORTS', submenuWidth: 236,
        submenus: [
            AdminNav.ADMIN_REPORTS,
            AdminNav.ADMIN_ACCOUNTS,
            AdminNav.ADMIN_BOOKINGS,
            AdminNav.ADMIN_LOCATIONS,
            AdminNav.ADMIN_INVOICES,
            AdminNav.ADMIN_PENDING_CHARGES,
            AdminNav.ADMIN_READY_FOR_PAYOUT,
            AdminNav.ADMIN_PAYOUTS,
            AdminNav.ADMIN_BOOKED_SPACE_CALENDAR
        ]
    },
    AdminNav.LOGIN_AS_ACCOUNT,
    AccountNav.SIGN_OUT
]
