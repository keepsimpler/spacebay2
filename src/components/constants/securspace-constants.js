export const UserType = Object.freeze({
    OWNER: "OWNER",
    ADMIN: "ADMIN",
    GATE_MANAGER: "GATEMANAGER",
    GATE_CLERK: "GATECLERK",
    THIRD_PARTY_ADMIN: "THIRD_PARTY_ADMIN",
    DISPATCHER: "DISPATCHER"
})

export const AccountType = Object.freeze({
    BUYER: "Buyer",
    SUPPLIER: "Supplier",
    ADMIN: "Admin"
})

export const SubscriptionType = Object.freeze({
    MARKETPLACE_ONLY: "MARKETPLACE_ONLY",
    GMS_LITE: "GMS_LITE",
    GMS_PRO: "GMS_PRO"
})

export const AuthorityType = Object.freeze({
    ACCOUNT: "ACCOUNT",
    THIRD_PARTY: "THIRD_PARTY"
})

export const PaymentType = Object.freeze({
    ACH: "ACH",
    CARD: "CARD"
})

export const VerificationType = Object.freeze({
    INSTANT: "INSTANT",
    MICRO_DEPOSIT: "MICRO_DEPOSIT"
})

export const BankAccountType = Object.freeze({
    COMPANY_CHECKING: { value: "COMPANY_CHECKING", label: "Company - Checking" },
    COMPANY_SAVINGS: { value: "COMPANY_SAVINGS", label: "Company - Savings" },
    INDIVIDUAL_CHECKING: { value: "INDIVIDUAL_CHECKING", label: "Individual - Checking" },
    INDIVIDUAL_SAVINGS: { value: "INDIVIDUAL_SAVINGS", label: "Individual - Savings" }
})

export const LogoType = Object.freeze({
    LOGO_TRANSPARENT: "logo-transparent",
    LOGO_WHITE: "logo-white"
})

export const UserTypeName = Object.freeze({
    GATE_CLERK: 'Gate Clerk',
    GATE_MANAGER: 'Gate Manager',
    DISPATCHER: 'Dispatcher',
    ADMIN: 'Administrator',
    ACCOUNT_OWNER: 'Account Owner'
})

export const BookingReasonDeclined = Object.freeze({
    PARTNER_DECLINED: 'PARTNER_DECLINED',
    AUTO_DECLINED: 'AUTO_DECLINED'
})