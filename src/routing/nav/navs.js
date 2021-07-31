import { LogoType } from "../../components/constants/securspace-constants";

const defaultNavConfig = {
    highlighted: false,
    logoType: LogoType.LOGO_TRANSPARENT,
    exact: false
}

const makeNavConfig = (config: {
    path: String,
    label: String }) => {

    return {
        ...defaultNavConfig,
        ...config
    }
}

const makeNav = (path: String, label: String, config?: {}) => {
    let newConfig = { path, label }
    if(config) {
        newConfig = { ...newConfig, ...config }
    }
    return makeNavConfig(newConfig)
}

export const LandingNav = Object.freeze({
    SEARCH: makeNav('search', 'SEARCH'),
    ABOUT: makeNav('about', 'ABOUT'),
    HOW_IT_WORKS: makeNav('how-it-works', 'HOW IT WORKS'),
    CONTACT: makeNav('contact', 'CONTACT'),
    BLOG: makeNav('blog', 'BLOG'),
    FAQ: makeNav('faq', 'FAQ'),
    LOG_IN: makeNav('login', 'LOG IN'),
    SIGN_UP: makeNav(
        'signup',
        'GET STARTED',
        { highlighted: true, className: "pointer", linkClassName: "no-link-hover" }
        )
})

export const AccountNav = Object.freeze({
    COMPANY_PROFILE: makeNav('company-profile', 'COMPANY'),
    LOCATIONS_PROFILE: makeNav('locations-profile', 'LOCATIONS'),
    USER_MANAGEMENT: makeNav('user-management', 'USERS'),
    NOTIFICATIONS_SETTINGS: makeNav('notification-settings', 'NOTIFICATIONS'),
    MY_SUBSCRIPTIONS: makeNav('my-subscriptions', 'MY SUBSCRIPTIONS'),
    SIGN_OUT: makeNav('logout', 'SIGN OUT')
})

export const AdminNav = Object.freeze({
    ADMIN_REPORTS: makeNav('admin-reports', 'CSV REPORTS'),
    ADMIN_ACCOUNTS: makeNav('admin-accounts', 'ACCOUNTS'),
    ADMIN_BOOKINGS: makeNav('admin-bookings', 'BOOKINGS'),
    ADMIN_LOCATIONS: makeNav('admin-locations', 'LOCATIONS'),
    ADMIN_INVOICES: makeNav('admin-invoices', 'INVOICES'),
    ADMIN_PENDING_CHARGES: makeNav('admin-pending-charges', 'PENDING CHARGES'),
    ADMIN_READY_FOR_PAYOUT: makeNav('admin-ready-for-payout', 'READY FOR PAYOUT'),
    ADMIN_PAYOUTS: makeNav('admin-payouts', 'PAYOUTS'),
    ADMIN_BOOKED_SPACE_CALENDAR: makeNav('admin-booked-space-calendar', 'BOOKED SPACE CALENDAR'),
    LOGIN_AS_ACCOUNT: makeNav('login-as-account', 'LOG IN AS ACCOUNT')
})

export const BuyerNav = Object.freeze({
    MY_BOOKINGS: makeNav('my-bookings', 'MY BOOKINGS'),
    BUYER_INVENTORY: makeNav('buyer-inventory', 'CURRENT INVENTORY'),
    BUYER_INTERCHANGES: makeNav('buyer-interchanges', 'INTERCHANGES'),
    BUYER_INVOICES: makeNav('buyer-invoices', 'INVOICES'),
    BUYER_BOOKED_SPACE_CALENDAR: makeNav('buyer-booked-space-calendar', 'BOOKED SPACE CALENDAR')
})

export const GateManagementNav = Object.freeze({
    CHECK_IN: makeNav('check-in', 'CHECK IN'),
    SUPPLIER_INVENTORY: makeNav('supplier-inventory', 'CURRENT INVENTORY'),
    SUPPLIER_INTERCHANGES: makeNav('supplier-interchanges', 'INTERCHANGES'),
    SUPPLIER_ACTIVITY_SUMMARY: makeNav('supplier-activity-summary', 'ACTIVITY SUMMARY')
})

export const SupplierNav = Object.freeze({
    GMS_LANDING: makeNav('gms-landing', 'GATE MANAGEMENT'),
    APPROVALS: makeNav('approvals', 'APPROVALS', { badge: true }),
    SUPPLIER_BOOKINGS: makeNav('supplier-bookings', 'ALL BOOKINGS'),
    SUPPLIER_INVOICES: makeNav('supplier-invoices', 'INVOICES'),
    READY_FOR_PAYOUT: makeNav('ready-for-payout', 'READY FOR PAYOUT'),
    SUPPLIER_PAYOUTS: makeNav('supplier-payouts', 'PAYOUTS'),
    SUPPLIER_BOOKED_SPACE_CALENDAR: makeNav('supplier-booked-space-calendar', 'BOOKED SPACE CALENDAR')
})

export const ThirdPartyNav = Object.freeze({
    PARTNER_DETAILS: makeNav('partner-details', 'PARTNER DETAILS')
})

export const MarketplaceOnlyGmsUserNav = Object.freeze({
    GMS_UPGRADE: makeNav('gms-upgrade', "UPGRADE REQUIRED")
})
