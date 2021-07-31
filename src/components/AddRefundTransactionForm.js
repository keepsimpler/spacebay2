import React, {Component} from 'react';
import '../css/views/booking-common.css';
import '../css/theme/mainContent.css';
import '../css/theme/forms.css';
import '../css/theme/forms-block.css';
import '../css/theme/buttons.css';
import {createLogoutOnFailureHandler} from "../util/LogoutUtil";
import Busy from "./Busy";
import {
    formatCurrencyValue, parseCurrencyValue,
    validateCurrencyValue
} from "../util/PaymentUtils";
import {toast} from 'react-toastify';

const $ = window.$;

class AddRefundTransactionForm extends Component {
    constructor(props) {
        super(props);

        this.state = Object.assign({
            refundAmount: null,
            fullRefund: true,
            reasonForRefund: ''
        });
    }

    handleFieldChange = event => {
        let name = event.target.name;
        let value = event.target.value;

        if ('refundAmount' === name) {
            if (!validateCurrencyValue(value)) {
                return;
            }
            value = parseCurrencyValue(value);
        }

        if ('fullRefund' === name) {
            value = !this.state.fullRefund;
            if (value) {
                this.setState({
                    refundAmount: null
                });
            }
        }

        this.setState({[name]: value});

    };

    submitAddRefund = () => {
        if (!this.state.fullRefund && !this.state.refundAmount) {
            toast.error("Please enter an amount.");
            return;
        }
        if (!this.state.reasonForRefund) {
            toast.error("Please enter a refund description.");
            return;
        }
        Busy.set(true);
        $.ajax({
                url: 'api/booking/refund-transaction',
                data: JSON.stringify({
                    transactionNumberToRefund: this.props.bookingTransaction.transactionNumber,
                    refundAmount: this.state.fullRefund ? null : this.state.refundAmount,
                    reasonForRefund: this.state.reasonForRefund
                }),
                type: 'POST',
                contentType: 'application/json; charset=UTF-8',
                dataType: "json",
                success:
                    (refundBookingTransaction) => {
                        Busy.set(false);
                        this.props.addRefundTransactionCompleted(refundBookingTransaction);
                    },
                statusCode:
                    {
                        401: createLogoutOnFailureHandler(this.props.handleLogout)
                    }
                ,
                error: (jqXHR, textStatus, errorThrown) => {
                    Busy.set(false);
                    let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message ? jqXHR.responseJSON.message.trim() : "" : "";
                    toast.error("Failed to create/request refund" + (errorMessage ? (': ' + errorMessage) : ''));
                }
            }
        )
        ;
    };

    render() {

        return (
            <div>
                <form className="ss-form ss-block">
                    <div>
                        <div className="modal-body">
                            <fieldset className="ss-top">
                                <label htmlFor="notes">REASON FOR REFUND</label>
                                <textarea id="reasonForRefund"
                                          required={true}
                                          name="reasonForRefund"
                                          value={this.state.reasonForRefund}
                                          onChange={this.handleFieldChange}
                                          placeholder="Enter the reason this refund is being given."
                                />
                            </fieldset>

                            <label className="ss-checkbox d-flex align-items-center">
                                <input type="checkbox"
                                       className="ss-checkbox-container-checkbox"
                                       name="fullRefund"
                                       checked={this.state.fullRefund}
                                       onChange={this.handleFieldChange}
                                />Full Refund?
                            </label>


                            {this.state.fullRefund ?
                                null
                                :
                                <fieldset className={"ss-top"}>
                                    <label htmlFor="refundAmount">REFUND AMOUNT</label>
                                    <input type="text"
                                           id="refundAmount"
                                           name="refundAmount"
                                           value={formatCurrencyValue(this.state.refundAmount)}
                                           onChange={this.handleFieldChange}
                                           maxLength={10}
                                           placeholder="Enter the amount to refund for this transaction."
                                    />
                                </fieldset>
                            }
                        </div>
                        <div className="modal-footer">
                            <div className="table text-center">
                                <button type="button" className="ss-button-secondary"
                                        onClick={() => this.submitAddRefund()}>
                                    {this.props.chargedButNotPaidOutToPartner ? 'Create Refund' : 'Request Refund'}
                                </button>
                                <button type="button" className="ss-button-primary"
                                        onClick={() => this.props.closeSubViewHandler()}>Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        );


    }
}

export default AddRefundTransactionForm;