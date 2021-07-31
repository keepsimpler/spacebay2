import request from '../../../util/SuperagentUtils';

export const requestGetFailedTransactionsForBooking = (bookingId : String,
                                                       onSuccess?: (failedTransactions: Array<Object>) => void,
                                                       onFail?: (err: Object) => void) : (Promise<Object> | void) => {
    const result = request
        .get(`/api/booking/${bookingId}/transactions/failed`)

    if(onSuccess && onFail) {
        result
            .then((resp) => onSuccess(resp.body))
            .catch((err) => onFail(err))
    } else {
        return result
    }
}

export const requestCompleteBooking = (
    data: { id: String, buyerAccountId: String, tosDocUrl: String, paymentMethodId: String },
    onSuccess?: (booking: Object) => void,
    onFail?: (err: Object) => void
    ) : (Promise<Object> | void) => {

    const result = request
        .post(`/api/booking/complete-booking`)
        .send(data)

    if(onSuccess && onFail) {
        result
            .then(resp => onSuccess(resp.body))
            .catch(err => onFail(err))
    } else {
        return result
    }
}

export const requestRetryFailedTransactionsForBooking = (bookingId: String,
                                                         onSuccess?: () => void,
                                                         onFail?: (err: Object) => void) : (Promise<Object> | void) => {
    const result = request
        .post(`/api/booking/${bookingId}/transactions/failed/retry`)

    if(onSuccess && onFail) {
        result
            .then(onSuccess)
            .catch(onFail)
    } else {
        return result
    }
}

export const requestReadSupplierPendingBooking = (id: String,
                                                  onSuccess?: () => void,
                                                  onFail?: (err: Object) => void) : Promise | void  => {
    const result = request
        .get(`api/booking/count-bookings?supplierAccountId=${id}&approvalsOnly=true`)

    if(onSuccess && onFail) {
        result
            .then(onSuccess)
            .catch(onFail)
    } else {
        return result
    }
}
