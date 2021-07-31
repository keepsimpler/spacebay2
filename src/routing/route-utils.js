import { AccountType, UserType, SubscriptionType } from "../components/constants/securspace-constants";
import AccountUtilService from "../services/account/AccountUtilService";

export const getLandingRedirectPathForUser = (user: { userType: String, accountType: String, subscriptionType: String }) : String => {

    const { userType, type: accountType, subscriptionType } = user || {}

    let redirectPath

    switch (accountType) {
        case AccountType.SUPPLIER:
            redirectPath = getLandingRedirectPathForSupplierSubscriptionType(subscriptionType, userType)
            break
        case AccountType.ADMIN:
            redirectPath = "/login-as-account"
            break
        case AccountType.BUYER:
            redirectPath = "/search"
            break
        default:
            redirectPath = "/"
    }

    if(userType === UserType.THIRD_PARTY_ADMIN) {
        redirectPath = "/partner-details"
    }

    if(AccountUtilService.userNeedsTosConfirmation(user)) {
        redirectPath = "/confirm-account"
    }

    return redirectPath
}

const getLandingRedirectPathForSupplierSubscriptionType = (subscriptionType: String, userType: String) => {
    let redirectPath

    switch (subscriptionType) {
        case SubscriptionType.MARKETPLACE_ONLY:
            redirectPath = getLandingRedirectPathForMarketplaceOnly(userType)
            break
        case SubscriptionType.GMS_PRO:
        case SubscriptionType.GMS_LITE:
            redirectPath = getLandingRedirectPathForGmsSubscription(userType)
            break
        default:
            forceLogoutOnInvalidState()

    }

    return redirectPath
}

const getLandingRedirectPathForMarketplaceOnly = (userType: String) : String => {
    let redirectPath

    switch (userType) {
        case UserType.GATE_MANAGER:
        case UserType.GATE_CLERK:
            redirectPath = "/gms-upgrade"
            break
        case UserType.ADMIN:
        case UserType.OWNER:
            redirectPath = "/locations-profile"
            break
        default:
            forceLogoutOnInvalidState()
    }

    return redirectPath
}

const getLandingRedirectPathForGmsSubscription = (userType: String) : String => {

    let redirectPath

    switch (userType) {
        case UserType.GATE_MANAGER:
            redirectPath = "/approvals"
            break
        case UserType.GATE_CLERK:
            redirectPath = "/check-in"
            break
        case UserType.ADMIN:
        case UserType.OWNER:
            redirectPath = "/locations-profile"
            break
        default:
            forceLogoutOnInvalidState()
    }

    return redirectPath
}

const forceLogoutOnInvalidState = () => {
    window.location.href = "/logout"
}
