import request from '../../../util/SuperagentUtils'

export const requestCognitoTokenForUser = (
    accountId: String,
    username: String): Promise<Object> => {

    if (accountId && username) {
        return request
            .get(`/api/account/${accountId}/cognito/token`)
            .query({ email: username })
    } else {
        console.error("Attempting request for cognito token with invalid account id or username")
    }
}

export const removeAccountFundingSource = (accountId: String, onSuccess: Function, onError: Function) => {
    return request.del(`/api/account/${accountId}/funding-sources`)
        .then((resp) => onSuccess(resp.body))
        .catch((err) => onError(err));
}

export const requestUpdateUserAccessibleLocations = (accountId: String, username: String, locationIds: Array<String>) : Promise => {
    return request
      .put(`/api/account-users/${accountId}`)
      .send({username, locationIds})
}
