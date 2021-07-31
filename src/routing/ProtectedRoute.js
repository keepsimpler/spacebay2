import React, { Component } from 'react'
import { Redirect } from "react-router-dom";
import { AppContext } from "../context/app-context";
import { AccountType } from "../components/constants/securspace-constants";
import { getLandingRedirectPathForUser } from "./route-utils";
import _ from 'underscore'
import AccountUtilService from "../services/account/AccountUtilService";

export const withAccessControl = (
    WrappedComponent,
    ...authorized : {
        userTypes: Array<String>,
        accountTypes: Array<String>,
        subscriptionTypes: Array<String>,
        additionalValidation?: (user: Object) => boolean
    }) => {

    return class ProtectedRoute extends Component {
        static contextType = AppContext

        generateUnauthorizedContent = () => {
            const appContext = this.context
            const { loadingUserDetails, user } = appContext

            // todo za -- loading component
            return loadingUserDetails ?
                <div />
                :
                <Redirect to={getLandingRedirectPathForUser(user)} />
        }

        render() {
            const appContext = this.context
            const { user } = appContext
            const { userType, type: accountType, subscriptionType } = user || {}

            let hasAuthorization = false

            if(authorized) {
                for(let i = 0; i < authorized.length; i++) {
                    const {
                        userTypes: allowedUserTypes,
                        accountTypes: allowedAccountTypes,
                        subscriptionTypes: allowedSubscriptionTypes,
                        additionalValidation
                    } = authorized[i]

                    hasAuthorization = _.contains(allowedUserTypes, userType)
                        && _.contains(allowedAccountTypes, accountType)

                    if(accountType === AccountType.SUPPLIER) {
                        hasAuthorization = hasAuthorization && _.contains(allowedSubscriptionTypes, subscriptionType)
                    }

                    if(additionalValidation) {
                        hasAuthorization = hasAuthorization && additionalValidation(user)
                    }

                    if(AccountUtilService.userNeedsTosConfirmation(user)) {
                        hasAuthorization = false
                    }

                    if(hasAuthorization) {
                        break;
                    }
                }
            }

            return hasAuthorization ? <WrappedComponent {...this.props} /> : this.generateUnauthorizedContent()
        }
    }
}
