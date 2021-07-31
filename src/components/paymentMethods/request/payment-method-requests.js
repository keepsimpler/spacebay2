import request from '../../../util/SuperagentUtils';
import {UserType, AuthorityType} from "../../constants/securspace-constants";

export const requestPaymentMethods = (id: String, userType: String, onSuccess: Function, onFail: Function) => {
    if (userType === UserType.THIRD_PARTY_ADMIN) {
        requestPaymentMethodsForThirdPartyId(id, onSuccess, onFail)
    } else {
        requestPaymentMethodsForAccountId(id, onSuccess, onFail)
    }
}

export const requestPaymentMethodsForAccountId = (accountId: String,
                                                  onSuccess: (paymentMethods: Array<Object>) => void,
                                                  onFail: (err: Object) => void) => {
    if (accountId) {
        request
            .get("/api/payment-method")
            .query({accountId})
            .then((resp) => onSuccess(resp.body))
            .catch((err) => onFail(err))
    }
}

export const requestPaymentMethodsForThirdPartyId = (thirdPartyId: String,
                                                     onSuccess: (paymentMethods: Array<Object>) => void,
                                                     onFail: (err: Object) => void) => {
    if (thirdPartyId) {
        request
            .get(`/api/third-party/${thirdPartyId}/payment-method`)
            .then((resp) => onSuccess(resp.body))
            .catch((err) => onFail(err))
    }
}

export const requestDeactivatePaymentMethod = (authorityId: String, paymentMethodId: String, userType: String,
                                               onSuccess: (resp: Object) => void, onFail: (err: Object) => void) => {
    if (userType === UserType.THIRD_PARTY_ADMIN) {
        requestDeactivateThirdPartyPaymentMethod(authorityId, paymentMethodId, onSuccess, onFail)
    } else {
        requestDeactivateAccountPaymentMethod(authorityId, paymentMethodId, onSuccess, onFail)
    }
}

export const requestDeactivateAccountPaymentMethod = (accountId: String, paymentMethodId: String, onSuccess: (resp: Object) => void,
                                                      onFail: (err: Object) => void) => {
    if (accountId && paymentMethodId) {
        request
            .post(`/api/payment-method/deactivate`)
            .send({
                id: paymentMethodId,
                accountId
            })
            .then((resp) => onSuccess(resp))
            .catch((err) => onFail(err))
    }
}

export const requestDeactivateThirdPartyPaymentMethod = (thirdPartyId: String, paymentMethodId: String,
                                                         onSuccess: (resp: Object) => void, onFail: (err: Object) => void) => {
    if (thirdPartyId && paymentMethodId) {
        request
            .delete(`/api/third-party/${thirdPartyId}/payment-method/${paymentMethodId}`)
            .then((resp) => onSuccess(resp))
            .catch((err) => onFail(err))
    }
}

export const requestRenamePaymentMethod = (data: { authorityId: String, paymentMethodId: String, nickName: String },
                                           userType: String, onSuccess: (resp: Object) => void, onFail: (err: Object) => void) => {

    if (userType === UserType.THIRD_PARTY_ADMIN) {
        requestRenameThirdPartyPaymentMethod({ ...data, thirdPartyId: data.authorityId }, onSuccess, onFail)
    } else {
        requestRenameAccountPaymentMethod({ ...data, accountId: data.authorityId }, onSuccess, onFail)
    }
}

export const requestRenameAccountPaymentMethod = (data: { accountId: String, paymentMethodId: String, nickName: String },
                                                  onSuccess: (resp: Object) => void,
                                                  onFail: (err: Object) => void) => {
    const {accountId, paymentMethodId, nickName} = data || {}

    if (accountId && paymentMethodId) {
        request
            .post(`/api/payment-method/rename`)
            .send({
                id: paymentMethodId,
                accountId,
                nickName
            })
            .then((resp) => onSuccess(resp))
            .catch((err) => onFail(err))
    }
}

export const requestRenameThirdPartyPaymentMethod = (data: { thirdPartyId: String, paymentMethodId: String, nickName: String },
                                                     onSuccess: (resp: Object) => void, onFail: (err: Object) => void) => {
    const {thirdPartyId, paymentMethodId, nickName} = data || {}

    if (thirdPartyId && paymentMethodId) {
        request
            .post(`/api/third-party/${thirdPartyId}/payment-method/${paymentMethodId}/rename`)
            .send({
                id: paymentMethodId,
                thirdPartyId,
                nickName
            })
            .then((resp) => onSuccess(resp))
            .catch((err) => onFail(err))
    }
}

export const requestToken = (authorityId: String, userType: String, onSuccess: (token: String) => void, onFail: (err: Object) => void) => {
    if (userType === UserType.THIRD_PARTY_ADMIN) {
        requestTokenForThirdParty(authorityId, onSuccess, onFail)
    } else {
        requestTokenForAccount(authorityId, onSuccess, onFail)
    }
}

export const requestTokenForAccount = (accountId: String, onSuccess: (token: Object) => void, onFail: (err: Object) => void) => {
    request
        .get(`/api/payment-method/token`)
        .query({
            accountId
        })
        .then((resp) => onSuccess(resp.body.token))
        .catch((err) => onFail(err))
}

export const requestTokenForThirdParty = (thirdPartyId: String, onSuccess: (token: Object) => void, onFail: (err: Object) => void) => {
    request
        .get(`/api/third-party/${thirdPartyId}/payment-method/token`)
        .then((resp) => onSuccess(resp.body.token))
        .catch((err) => onFail(err))
}

export const requestPaymentProcessorEnvironmentDetails = (onSuccess?: (env: Object) => void, onFail?: (err: Object) => void) : (Promise<Object> | void) => {
    const result = request
        .get(`/api/payment-method/environment`)

    if(onSuccess) {
        result
            .then((resp) => onSuccess(resp.body))
            .catch((err) => onFail(err))

    } else {
        return result
            .then((resp) => resp.body)
    }
}

export const requestAddStripePaymentMethod = (
    data: { authorityId: String, userType: String, stripeToken: String },
    onSuccess: Function,
    onFail: Function) => {

    const { userType } = data

    if(userType === UserType.THIRD_PARTY_ADMIN) {
        requestAddStripePaymentMethodToThirdParty(data, onSuccess, onFail)
    } else {
        requestAddStripePaymentMethodToAccount({ ...data, accountId: data.authorityId }, onSuccess, onFail)
    }

}

export const requestAddStripePaymentMethodToAccount = (
    data: { accountId: String, stripeToken: String }, onSuccess, onFail) => {
    requestAddAccountPaymentMethod(data, onSuccess, onFail)
}

export const requestAddStripePaymentMethodToThirdParty = (
    data: { authorityId: String, stripeToken: String },
    onSuccess: Function,
    onFail: Function) => {

    requestAddThirdPartyPaymentMethod(data, onSuccess, onFail)
}

export const requestAddPlaidPaymentMethod = (
    data: { authorityId: String, userType: String, plaidPublicToken: String, plaidAccountId: String },
    onSuccess: Function,
    onFail: Function) => {

    const { authorityId, userType } = data

    if(UserType.THIRD_PARTY_ADMIN === userType) {
        requestAddPlaidPaymentMethodToThirdParty(data, onSuccess, onFail)
    } else {
        requestAddPlaidPaymentMethodToAccount({ ...data, accountId: authorityId }, onSuccess, onFail)
    }
}

export const requestAddPlaidPaymentMethodToAccount = (
    data: { accountId: String, plaidPublicToken: String, plaidAccountId: String },
    onSuccess: Function,
    onFail: Function) => {

    requestAddAccountPaymentMethod(data, onSuccess, onFail)
}

export const requestAddPlaidPaymentMethodToThirdParty = (
    data: { authorityId: String, plaidPublicToken: String, plaidAccountName: String },
    onSuccess: Function,
    onFail: Function) => {

    requestAddThirdPartyPaymentMethod(data, onSuccess, onFail)
}

export const requestAddDwollaPaymentMethod = (
    data: {authorityId: String, userType: String, dwollaFundingSourceId: String},
    onSuccess: Function,
    onFail: Function) => {

    const { authorityId, userType, dwollaFundingSourceId } = data

    if(UserType.THIRD_PARTY_ADMIN === userType) {
        requestAddDwollaPaymentMethodToThirdParty(authorityId, dwollaFundingSourceId, onSuccess, onFail)
    } else {
        requestAddDwollaPaymentMethodToAccount(authorityId, dwollaFundingSourceId, onSuccess, onFail)
    }
}

export const requestAddDwollaPaymentMethodToAccount = (accountId: String, dwollaFundingSourceId: String,
                                                       onSuccess: Function, onFail: Function) => {
    requestAddAccountPaymentMethod({accountId, dwollaFundingSourceId}, onSuccess, onFail)
}

export const requestAddDwollaPaymentMethodToThirdParty = (thirdPartyId: String, dwollaFundingSourceId: String,
                                                          onSuccess: Function, onFail: Function) => {
    requestAddThirdPartyPaymentMethod({authorityId: thirdPartyId, dwollaFundingSourceId}, onSuccess, onFail)
}

export const requestMakePaymentMethodDefault = (
    paymentMethodId: String,
    onSuccess?: () => void,
    onFail?: (err: Object) => void) : (Promise<void> | void) => {
    const result = request
        .post(`/api/payment-method/${paymentMethodId}/default`)

    if(onSuccess) {
        result
            .then(() => onSuccess())
            .catch((err) => onFail(err))
    } else {
        return result
    }
}

export const requestVerifyBankAccount = (
    data: { paymentMethodId: String, microDeposit1: Number, microDeposit2: Number },
    onSuccess?: (updatedPaymentMethod: Object) => void,
    onFail?: (err: Object) => void
    ) : (Promise<Object> | void) => {

    const result = request
        .post(`/api/payment-method/verify`)
        .send(data)

    if(onSuccess) {
        result
            .then((resp) => onSuccess(resp.body))
            .catch((err) => onFail(err))
    } else {
        return result
    }
}

const requestAddAccountPaymentMethod = (data, onSuccess, onFail) => {
    request
        .post('/api/payment-method')
        .send(data)
        .then((resp) => onSuccess(resp))
        .catch((err) => onFail(err))
}

const requestAddThirdPartyPaymentMethod = (data, onSuccess, onFail) => {
    const { authorityId } = data
    request
        .post(`/api/third-party/${authorityId}/payment-method`)
        .send({
            ...data,
            authorityType: AuthorityType.THIRD_PARTY
        })
        .then((resp) => onSuccess(resp))
        .catch((err) => onFail(err))
}
