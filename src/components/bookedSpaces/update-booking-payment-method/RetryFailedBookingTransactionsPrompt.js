import React, {Component} from 'react'
import {getErrorMessageForStandardResponse} from "../../../util/NetworkErrorUtil";
import {requestRetryFailedTransactionsForBooking} from "../request/booked-spaces-requests";
import UpdatePaymentMethodSuccessText from "./UpdatePaymentMethodSuccessText";
import CurrencyFormat from "../../CurrencyFormat";
import PropTypes from 'prop-types'
import Busy from "../../Busy";

export default class RetryFailedBookingTransactionsPrompt extends Component {
    static propTypes = {
        bookingId: PropTypes.string.isRequired,
        onClose: PropTypes.func.isRequired,
        failedTransactionSummary: PropTypes.shape({
            totalCharge: PropTypes.number.isRequired,
            failedTransactionCount: PropTypes.number.isRequired
        }),
        errorMsg: PropTypes.string
    }

    static currencyFormatter = new CurrencyFormat();

    constructor(props) {
        super(props);

        this.state = {
            retrySuccessful: false
        }
    }

    handleRetryFailedTransactions = () => {
        const { bookingId } = this.props

        Busy.set(true)

        requestRetryFailedTransactionsForBooking(bookingId)
            .then((resp) => {
                Busy.set(false)
                this.setState({retrySuccessful: true})
            })
            .catch((err) => {
                Busy.set(false)
                this.setState({
                    errorMsg: getErrorMessageForStandardResponse(err)
                })
            })
    }

    render() {
        const {
            onClose,
            failedTransactionSummary: { totalCharge, failedTransactionCount }
        } = this.props

        return (
            <div>
                {
                    this.state.retrySuccessful ?
                        <div>
                            <div className="payment-method-action-modal-header">
                                Update Payment Method
                            </div>
                            <div className="payment-method-action-modal-prompt fw-400">
                                Payment Method has been updated and applied to all outstanding failed payments.
                                <br />
                                <br />
                                Please view invoices to confirm that payments processed successfully.
                            </div>
                            <div className="payment-method-action-modal-prompt-footer">
                                <div className="payment-method-action-modal-prompt-btn-container">
                                    <div onClick={onClose}
                                         className="ss-button-primary payment-method-action-modal-prompt-btn payment-method-action-modal-btn-confirm">
                                        Done
                                    </div>
                                </div>
                            </div>
                        </div>
                        :
                        (
                            <div>
                                <div className="payment-method-action-modal-header">
                                    Update Payment Method
                                </div>
                                <div className="payment-method-action-modal-prompt fw-400">

                                    <UpdatePaymentMethodSuccessText />

                                    <div>
                                        <br />
                                        <div>
                                            This booking currently has <b>{failedTransactionCount} failed</b> { failedTransactionCount === 1 ? "transaction " : "transactions " }
                                            totalling <b>{RetryFailedBookingTransactionsPrompt.currencyFormatter.format(totalCharge)}</b>.
                                        </div>
                                        <br />
                                        <div>
                                            You may now try to run these charges again.
                                        </div>
                                    </div>
                                </div>
                                <div className="payment-method-action-modal-prompt-footer">
                                    <div className="payment-method-action-modal-prompt-btn-container">
                                        <div onClick={onClose}
                                             className="ss-button-secondary payment-method-action-modal-prompt-btn">
                                            Continue without retrying
                                        </div>
                                        <div onClick={this.handleRetryFailedTransactions} className="ss-button-primary payment-method-action-modal-prompt-btn payment-method-action-modal-btn-confirm">
                                            Try failed transactions again
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                }
            </div>
        )
    }
}
