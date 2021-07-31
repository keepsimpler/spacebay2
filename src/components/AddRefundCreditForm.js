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

class AddRefundCreditForm extends Component {
    constructor(props) {
        super(props);

        this.state = Object.assign({
            refundCreditAmount: '',
            reasonForRefund: ''
        });
    }

    handleFieldChange = event => {
        let name = event.target.name;
        let value = event.target.value;

        if ('refundCreditAmount' === name) {
            if (!validateCurrencyValue(value)) {
                return;
            }
            value = parseCurrencyValue(value);
        }

        this.setState({[name]: value});
    };

    submitAddRefundCredit = () => {
        if (!this.state.refundCreditAmount) {
            toast.error("Please enter an amount.");
            return;
        }

        if (!this.state.reasonForRefund) {
            toast.error("Please give a reason for this refund.");
            return;
        }

        Busy.set(true);

        $.ajax({
            url: 'api/invoices/add-refund-credit',
            data: JSON.stringify({
                bookingTransactionId: this.props.bookingTransactionId,
                refundCreditAmount: this.state.refundCreditAmount,
                reasonForRefund: this.state.reasonForRefund
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: (bookingTransaction) => {
                Busy.set(false);
                this.props.addRefundCreditCompleted(bookingTransaction);
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: (jqXHR) => {
                Busy.set(false);
                let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message ? jqXHR.responseJSON.message.trim() : "" : "";
                toast.error("Failed to add refund credit:  " + errorMessage);
            }
        });
    };

    render() {

        return (
            <div>
                <h3 className={'ss-summary' + (this.props.display === 'popup') ? 'hidden' : ''}>
                    Add Refund Credit To Invoice
                </h3>
                <form className="ss-form ss-block">
                    <div>
                        <div className="modal-body">
                            <fieldset className={"ss-top"}>
                                <label htmlFor="refundCreditAmount">REFUND CREDIT AMOUNT</label>
                                <input type="text"
                                       id="refundCreditAmount"
                                       name="refundCreditAmount"
                                       value={formatCurrencyValue(this.state.refundCreditAmount)}
                                       onChange={this.handleFieldChange}
                                       maxLength={10}
                                       placeholder="Enter the amount to refund to this invoice."
                                />
                            </fieldset>
                            <fieldset className="ss-bottom">
                                <label htmlFor="notes">REASON FOR REFUND</label>
                                <textarea type="text"
                                          id="reasonForRefund"
                                          name="reasonForRefund"
                                          value={this.state.reasonForRefund}
                                          onChange={this.handleFieldChange}
                                          placeholder="Enter the reason this refund is being given."
                                />
                            </fieldset>
                        </div>
                        <div className="modal-footer">
                            <div className="table text-center">
                                <button type="button" className="ss-button-secondary"
                                        onClick={() => this.submitAddRefundCredit()}>
                                    Add Refund Credit
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

export default AddRefundCreditForm;