import React, { Component } from 'react'
import { getErrorMessageForStandardResponse } from "../../../util/NetworkErrorUtil";
import { requestGetFailedTransactionsForBooking } from "../request/booked-spaces-requests";
import RetryFailedBookingTransactionsPrompt from "./RetryFailedBookingTransactionsPrompt";
import UpdatePaymentMethodSuccessText from "./UpdatePaymentMethodSuccessText";
import PropTypes from 'prop-types'
import Busy from "../../Busy";

import 'css/payment-method-action-modal.css'

export default class UpdateBookingPaymentMethodSuccess extends Component {

    static propTypes = {
        bookingId: PropTypes.string.isRequired,
        onClose: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);

        const { bookingId } = props

        if(bookingId) {
            Busy.set(true)
            requestGetFailedTransactionsForBooking(bookingId)
                .then(this.handleGetFailedTransactionsSuccess)
                .catch(this.handleGetFailedTransactionsFailure)
        }

        this.state = {
            failedTransactionSummary: {},
            errorMsg: null,
            retrySuccessful: false
        }

    }

    handleGetFailedTransactionsSuccess = ({ body: failedTransactionSummary }) : void => {
        Busy.set(false)

        const {
            bookingTransactions
        } = failedTransactionSummary

        if(bookingTransactions && bookingTransactions.length > 0) {
            this.setState({
                failedTransactionSummary
            })
        }
    }

    handleGetFailedTransactionsFailure = (err: Object) : void => {
        Busy.set(false)
        this.setState({
            errorMsg: getErrorMessageForStandardResponse(err)
        })
    }

    render() {

        const { onClose, bookingId } = this.props
        const {
            errorMsg,
            failedTransactionSummary
        } = this.state

        const { failedTransactionCount } = failedTransactionSummary

        return (

            <div>
                {
                    failedTransactionCount > 0 ?
                        <RetryFailedBookingTransactionsPrompt bookingId={bookingId} onClose={onClose} failedTransactionSummary={failedTransactionSummary} />
                        :
                        <div>
                            <div className="payment-method-action-modal-header">
                                Update Payment Method
                            </div>

                            <div className="payment-method-action-modal-prompt fw-400">
                                <UpdatePaymentMethodSuccessText />
                            </div>

                            <div className="payment-method-action-modal-prompt-footer">

                                { errorMsg && <div className="ss-error payment-method-action-modal-error">{errorMsg}</div> }

                                <div className="payment-method-action-modal-prompt-btn-container">
                                    <div onClick={onClose} className="ss-button-primary payment-method-action-modal-prompt-btn payment-method-action-modal-btn-confirm">
                                        Done
                                    </div>
                                </div>
                            </div>
                        </div>
                }
            </div>
        );
    }
}
