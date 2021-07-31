import { AccountType, UserType, SubscriptionType } from "../components/constants/securspace-constants";
import _ from 'underscore'

export default class AccessControlBuilder {
    _userTypes = [UserType.ADMIN]
    _accountTypes = []
    _subscriptionTypes = []

    build = () => {
        return {
            userTypes: this._userTypes,
            accountTypes: this._accountTypes,
            subscriptionTypes: this._subscriptionTypes
        }
    }

    allowUserType = (userType: String) => {
        if(!_.contains(this._userTypes, userType)) {
            this._userTypes.push(userType)
        }

        return this
    }

    allowAccountType = (accountType: String) => {
        if(!_.contains(this._accountTypes, accountType)) {
            this._accountTypes.push(accountType)
        }

        return this
    }

    allowSubscriptionType = (subscriptionType: String) => {
        if(!_.contains(this._subscriptionTypes, subscriptionType)) {
            this._subscriptionTypes.push(subscriptionType)
        }

        return this

    }

    allowAllOwners = () => {
        this.allowUserType(UserType.OWNER)
        this.allowAccountType(AccountType.SUPPLIER)
        this.allowAccountType(AccountType.BUYER)
        this.allowAllSubscriptionTypes()

        return this
    }

    allowAllBuyer = () => {
        this.allowUserType(UserType.OWNER)
        this.allowUserType(UserType.DISPATCHER)
        this.allowAccountType(AccountType.BUYER)
        this.allowAllSubscriptionTypes()

        return this
    }

    allowBuyerOwner = () => {
        this.allowUserType(UserType.OWNER)
        this.allowAccountType(AccountType.BUYER)
        this.allowAllSubscriptionTypes()

        return this
    }

    allowAllGmsUsers = () => {
        this.allowUserType(UserType.OWNER)
        this.allowUserType(UserType.GATE_MANAGER)
        this.allowUserType(UserType.GATE_CLERK)

        this.allowAccountType(AccountType.SUPPLIER)

        this.allowGmsSubscriptionTypes()

        return this
    }

    allowAllSupplierOwner = () => {
        this.allowUserType(UserType.OWNER)
        this.allowAccountType(AccountType.SUPPLIER)
        this.allowAllSubscriptionTypes()

        return this
    }

    allowGateManager = () => {
        this.allowUserType(UserType.GATE_MANAGER)
        this.allowAccountType(AccountType.SUPPLIER)
        this.allowGmsSubscriptionTypes()

        return this
    }

    allowMarketplaceOnlySupplier = () => {
        this.allowUserType(UserType.OWNER)
        this.allowAccountType(AccountType.SUPPLIER)
        this.allowSubscriptionType(SubscriptionType.MARKETPLACE_ONLY)

        return this
    }

    allowGmsProOwner = () => {
        this.allowUserType(UserType.OWNER)
        this.allowAccountType(AccountType.SUPPLIER)
        this.allowSubscriptionType(SubscriptionType.GMS_PRO)

        return this
    }

    allowAdmin = () => {
        this.allowUserType(UserType.ADMIN)
        this.allowAccountType(AccountType.ADMIN)
        return this
    }

    allowAllSubscriptionTypes = () => {
        this.allowSubscriptionType(SubscriptionType.MARKETPLACE_ONLY)
        this.allowGmsSubscriptionTypes()

        return this
    }

    allowGmsSubscriptionTypes = () => {
        this.allowSubscriptionType(SubscriptionType.GMS_LITE)
        this.allowSubscriptionType(SubscriptionType.GMS_PRO)

        return this
    }

    /*
        todo za -- modify third party authority source to have relevant information
        when work resumes on third party partner portal
     */
    allowThirdPartyAdmins = () => {
        this.allowUserType(UserType.THIRD_PARTY_ADMIN)


        return this
    }
}
