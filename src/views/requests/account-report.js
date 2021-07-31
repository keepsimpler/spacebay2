
import request from "../../util/SuperagentUtils";

export const requestCreatePayouts = (payoutRequest) : Promise => {
    return request.post(`api/suppliers/create-payouts`)
        .send(payoutRequest)
}

export const requestReadyForPayoutTransactionsForAccount = (accountId : String) : Promise => {
    return request
      .get(`api/suppliers/${accountId}/ready-for-payout`)
}
