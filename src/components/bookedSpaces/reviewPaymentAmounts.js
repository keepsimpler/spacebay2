import React, {Component} from 'react';
import '../../css/views/booking-common.css';
import '../../css/theme/mainContent.css';
import '../../css/theme/forms.css';
import '../../css/theme/forms-block.css';
import '../../css/theme/buttons.css';
import {formatCurrencyValue} from '../../util/PaymentUtils';


import Error from "../../components/Error";

class ReviewPaymentAmounts extends Component {

    constructor(props) {
        super(props);
        this.state = props.state;

    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        this.setState(nextProps.state)
    }


    render() {
        return (
            <div>
                <div className="modal-body">
                    <div id="reviewPaymentAmounts">
                        <h4 className="ss-summary">
                            {this.state.payWithAch ? '4' : '3'}. Review
                            Payment Details
                        </h4>
                        <div>
                            {
                                this.state.initialBookingChargeAmount === 'Calculating....' ?
                                    <div>
                                        Calculating Payment Info...
                                    </div>
                                    :
                                    this.state.bookingToComplete.frequency === 'RECURRING' ?
                                        <div>
                                            {
                                                !this.state.updatingPaymentMethod ?
                                                    <div>
                                                        <p>
                                                            <span>Initial Payment</span>
                                                            <span>{this.state.initialBookingPaymentAmount === 0 ? "$0"
                                                                : formatCurrencyValue(this.state.initialBookingPaymentAmount)}</span>
                                                        </p>
                                                        <p>
                                                            <span>Credit Card Processing Fee</span>
                                                            <span>{this.state.initialBookingPaymentProcessingFee === 0 ? "$0"
                                                                : formatCurrencyValue(this.state.initialBookingPaymentProcessingFee)}</span>
                                                        </p>

                                                        <p>
                                                            <strong>
                                                            <span>{this.state.totalNumberOfPayments && this.state.totalNumberOfPayments > 0 ? 'Due Now:'
                                                                : 'Total Cost:'}
                                                                </span>
                                                                <span>{this.state.initialBookingChargeAmount === 0 ? "$0"
                                                                    : formatCurrencyValue(this.state.initialBookingChargeAmount)}
                                                                    </span>
                                                            </strong>
                                                        </p>
                                                    </div>
                                                    :
                                                    ''
                                            }
                                            {
                                                this.state.totalNumberOfPayments && this.state.totalNumberOfPayments > 0 ?
                                                    <div>
                                                        <p>
                                                            <span>Number Of Payments:</span>
                                                            <span>{this.state.totalNumberOfPayments}</span>
                                                        </p>
                                                    </div>
                                                    :
                                                    ''
                                            }
                                            {
                                                this.state.totalNumberOfPayments && this.state.totalNumberOfPayments > 0 ?
                                                    <div>
                                                        <p>
                                                            <span>First Payment Date:</span>
                                                            <span>{this.state.firstRecurringPaymentDate}</span>
                                                        </p>
                                                    </div>
                                                    :
                                                    ''
                                            }
                                            {
                                                this.state.totalNumberOfPayments && this.state.totalNumberOfPayments > 0 ?
                                                    <div>
                                                        <p>
                                                            <span>Last Payment Date:</span>
                                                            <span>{this.state.lastRecurringPaymentDate}</span>
                                                        </p>
                                                    </div>
                                                    :
                                                    ''
                                            }
                                            {
                                                this.state.totalNumberOfPayments && this.state.totalNumberOfPayments > 0 ?
                                                    <div>
                                                        <p>
                                                            <span>{(this.state.bookingToComplete.durationType === 'WEEKLY' ? 'Weekly' : 'Monthly') + ' Payment:'}</span>
                                                            <span>{this.state.recurringBookingPaymentAmount === 0 ? "$0"
                                                                : formatCurrencyValue(this.state.recurringBookingPaymentAmount)}</span>
                                                        </p>
                                                        <p>
                                                            <span>Credit Card Processing Fee</span>
                                                            <span>{this.state.recurringBookingPaymentProcessingFee === 0 ? "$0"
                                                                : formatCurrencyValue(this.state.recurringBookingPaymentProcessingFee)}</span>
                                                        </p>
                                                        <p>
                                                            <strong>
                                                                <span>{'Total ' + (this.state.bookingToComplete.durationType === 'WEEKLY' ? 'Weekly' : 'Monthly') + ' Cost:'}</span>
                                                                <span>{this.state.recurringBookingChargeAmount === 0 ? "$0"
                                                                    : formatCurrencyValue(this.state.recurringBookingChargeAmount)}</span>
                                                            </strong>
                                                        </p>
                                                    </div>
                                                    :
                                                    ''
                                            }
                                        </div>
                                        :
                                        <div>
                                            <p>
                                                <span>One-Time Payment:</span>
                                                <span>{this.state.initialBookingPaymentAmount === 0 ? "$0"
                                                    : formatCurrencyValue(this.state.initialBookingPaymentAmount)}</span>
                                            </p>
                                            <p>
                                                <span>Credit Card Processing Fee:</span>
                                                <span>{this.state.initialBookingPaymentProcessingFee === 0 ? "$0"
                                                    : formatCurrencyValue(this.state.initialBookingPaymentProcessingFee)}</span>
                                            </p>

                                            <p>
                                                <strong>
                                                    <span>Total Cost:</span>
                                                    <span>{this.state.initialBookingChargeAmount === 0 ? "$0"
                                                        : formatCurrencyValue(this.state.initialBookingChargeAmount)}</span>
                                                </strong>
                                            </p>
                                        </div>
                            }
                        </div>
                        {
                            this.state.completeBookingErrorMessage ?
                                <Error>{this.state.completeBookingErrorMessage}</Error> : ''
                        }
                        {
                            this.state.errorMessage ?
                                <Error>{this.state.errorMessage}</Error> : ''
                        }
                    </div>
                </div>
                <div className="modal-footer">
                    <div className="table text-center">
                        <button type="button"
                                onClick={() => this.props.resetButton('reviewPayment')}
                                className="ss-button-secondary">Back
                        </button>
                        <button type="button"
                                onClick={this.props.collectPaymentInfo}
                                className="ss-button-primary">Next
                        </button>
                    </div>
                </div>
            </div>

        )
    }
}

export default ReviewPaymentAmounts;
