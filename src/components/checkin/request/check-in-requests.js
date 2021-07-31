import request from '../../../util/SuperagentUtils';

export const requestCheckInFieldsForAccountId = (accountId: String) => {

    if(accountId) {
        return request.get(`/api/account/${accountId}/check-in-fields`)
    }
}
