import React, {Component} from 'react';
import {formatCurrencyValue} from "../util/PaymentUtils";
import AccountReport from "./AccountReport";
import getDisplayValue from "../components/SupplierTransactionStatus";
import AddRefundCreditForm from "../components/AddRefundCreditForm";
import AddRefundTransactionForm from "../components/AddRefundTransactionForm";
import Busy from "../components/Busy";
import {createLogoutOnFailureHandler} from "../util/LogoutUtil";
import {toast} from "react-toastify";
import moment from "moment";
import URLUtils from "../util/URLUtils";
import {NavLink} from "react-router-dom";

const $ = window.$;

const chargedButNotPaidOutToPartnerStatuses = [
    'PAYMENT_PENDING',
    'PAYMENT_SUCCEEDED',
    'SECURSPACE_PAYOUT_PENDING',
    'SECURSPACE_PAYOUT_SUCCEEDED',
    'SECURSPACE_PAYOUT_FAILED',
    'SECURSPACE_PAYOUT_CANCELED',
    'SUPPLIER_PAYOUT_FAILED_SECURSPACE_FEE_PAYOUT_SUCCEEDED',
    'SUPPLIER_PAYOUT_FAILED'
];

const DONT_SHOW_INCLUDE_IN_PAYOUT_STATUSES = [
    "REFUND_REQUESTED",
    "SUPPLIER_PAYOUT_INITIATING",
    "SUPPLIER_PAYOUT_PENDING",
    "SUPPLIER_PAYOUT_ON_HOLD",
    "SUPPLIER_PAYOUT_SUCCEEDED",
    "SUPPLIER_PAYOUT_FAILED_SECURSPACE_FEE_PAYOUT_SUCCEEDED",
    "SUPPLIER_PAYOUT_SUCCEEDED_SECURSPACE_FEE_PAYOUT_FAILED",
    "SUPPLIER_PAYOUT_FAILED"
];

export default class AdminInvoicesReport extends Component {

    constructor(props) {
        super(props);

        let initialSearchText = URLUtils.getQueryVariable('bookingNumber');
        if (!initialSearchText) {
            initialSearchText = '';
        }

        this.state = {
            account: this.props.account,
            bookingTransactions: [],
            addRefundCreditTransaction: '',
            addRefundTransaction: '',
            initialSearchText: initialSearchText
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.account !== this.state.account) {
            this.setState({account: nextProps.account});
            this.loadTransactions();
        }
    }

    componentDidMount() {
        this.loadTransactions();
    }

    loadTransactions = () => {
        Busy.set(true);
        $.ajax({
            url: 'api/admins/transactions',
            type: 'GET',
            contentType: 'application/json; charset=UTF-8',
            success: (data) => {
                this.setState({bookingTransactions: data}, () => {
                    Busy.set(false);
                });
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: (jqXHR) => {
                Busy.set(false);
                let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message ? jqXHR.responseJSON.message.trim() : "" : "";
                toast.error("Failed to load Transactions:  " + errorMessage);
            }
        });
    };

    viewInvoice = (item) => {
        window.open(this.props.account.baseUrl + "/api/invoices-by-invoice-number/" + item.transactionNumber);
    };

    viewInventoryLog = (item) => {
        window.open(this.props.account.baseUrl + '/api/overage-daily-report-by-invoice-number/' + item.transactionNumber);
    };

    completeRefund = (item, deductFromNextPayout) => {
        Busy.set(true);
        $.ajax({
            url: '/api/booking/complete-refund',
            data: JSON.stringify({
                transactionId: item.transactionId,
                deductFromNextPayout: deductFromNextPayout
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: (refundBookingTransaction) => {
                Busy.set(false);
                toast.success("Successfully completed refund!");
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: (jqXHR) => {
                Busy.set(false);
                let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message ? jqXHR.responseJSON.message.trim() : "" : "";
                toast.error("Failed to complete refund:  " + errorMessage);
            }
        });
    };

    denyRefund = (item) => {
        Busy.set(true);
        $.ajax({
            url: '/api/booking/deny-refund',
            data: JSON.stringify({
                id: item.transactionId
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: (refundBookingTransaction) => {
                Busy.set(false);
                toast.success("Successfully denied refund!");
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: (jqXHR) => {
                Busy.set(false);
                let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message ? jqXHR.responseJSON.message.trim() : "" : "";
                toast.error("Failed to deny refund:  " + errorMessage);
            }
        });
    };

    retryPayment = (item) => {
        Busy.set(true);
        $.ajax({
            url: '/api/booking/retry-charging-transaction',
            data: JSON.stringify({
                bookingTransactionId: item.transactionId
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: (data) => {
                Busy.set(false);
                toast.success("Successfully retried charging failed payment!");
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: (jqXHR) => {
                Busy.set(false);
                let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message ? jqXHR.responseJSON.message.trim() : "" : "";
                toast.error("Failed to retry payment:  " + errorMessage);
            }
        });
    };

    toggleIncludeRefundInPayout = (item) => {
        let _this = this;
        Busy.set(true);
        const newIncludeValue = !item.includeRefundInPayout;
        $.ajax({
            url: `/api/booking-transaction/${item.transactionId}/include-refund-in-payout`,
            data: JSON.stringify({
                bookingTransactionId: item.transactionId,
                include: newIncludeValue
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            success: (data) => {
                Busy.set(false);
                if (newIncludeValue) {
                    toast.success("Successfully included this invoice in the next payout");
                } else {
                    toast.success("Successfully excluded this invoice from the next payout");
                }

                let newBookingTransactions = [..._this.state.bookingTransactions];
                let foundIndex = newBookingTransactions.findIndex(x => x.transactionId === item.transactionId);
                newBookingTransactions[foundIndex].includeRefundInPayout = newIncludeValue;
                _this.setState({bookingTransactions: newBookingTransactions});
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: (jqXHR) => {
                Busy.set(false);
                let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message ? jqXHR.responseJSON.message.trim() : "" : "";
                toast.error("Failed to update the invoice:  " + errorMessage);
            }
        });
    };

    putPayoutOnHold = (item) => {
        Busy.set(true);
        $.ajax({
            url: '/api/booking/put-payout-on-hold',
            data: JSON.stringify({
                bookingTransactionId: item.transactionId
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            success: () => {
                Busy.set(false);
                toast.success("Successfully put payout on hold!");
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: (jqXHR) => {
                Busy.set(false);
                let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message ? jqXHR.responseJSON.message.trim() : "" : "";
                toast.error("Failed to put payout on hold:  " + errorMessage);
            }
        });
    };

    takePayoutOffHold = (item) => {
        Busy.set(true);
        $.ajax({
            url: '/api/booking/take-payout-off-hold',
            data: JSON.stringify({
                bookingTransactionId: item.transactionId
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            success: () => {
                Busy.set(false);
                toast.success("Successfully took payout off hold!");
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: (jqXHR) => {
                Busy.set(false);
                let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message ? jqXHR.responseJSON.message.trim() : "" : "";
                toast.error("Failed to take payout off hold:  " + errorMessage);
            }
        });
    };

    showAddRefundCreditView = (transaction) => {
        this.setState({
            addRefundCreditTransaction: transaction
        })
    };

    showAddRefundTransactionView = (transaction) => {
        this.setState({
            addRefundTransaction: transaction
        })
    };

    closeAllDialogs = (event) => {
        this.setState({
            addRefundCreditTransaction: null,
            addRefundTransaction: null
        });
    };

    addRefundCreditCompleted = (bookingTransaction) => {
        let bookingTransactions = this.state.bookingTransactions;
        let foundIndex = bookingTransactions.findIndex(x => x.id === bookingTransaction.id);
        bookingTransactions[foundIndex] = bookingTransaction;
        this.setState({bookingTransactions: bookingTransactions});
        this.closeAllDialogs();
        toast.success('Successfully added refund credit to invoice!');
    };

    addRefundTransactionCompleted = (refundBookingTransaction) => {
        let refundRequested = 'REFUND_REQUESTED' === refundBookingTransaction.status;
        this.closeAllDialogs();
        if (refundRequested) {
            toast.success('Successfully submitted refund request!  Refund Invoice:  ' + refundBookingTransaction.transactionNumber);
        } else {
            toast.success('Successfully created refund!  Refund Invoice:  ' + refundBookingTransaction.transactionNumber);
        }
    };
    render() {
        let addRefundCreditView = (bookingTransactionId) => {
            return (
                <div className="unselectable">
                    <div className="modal-dialog">
                        <div className="modal-content ">
                            <div className="popup-header">
                                <h1>Add Refund Credit To Invoice</h1>
                                <button type="button" className="close pull-right"
                                        aria-label="Close"
                                        onClick={this.closeAllDialogs}>
                                    <img alt="" src="../app-images/close.png"/>
                                </button>
                            </div>


                            <AddRefundCreditForm
                                display="popup"
                                bookingTransactionId={bookingTransactionId}
                                closeSubViewHandler={this.closeAllDialogs}
                                addRefundCreditCompleted={this.addRefundCreditCompleted}
                            />
                        </div>
                    </div>
                </div>
            )
        };
        let addRefundTransactionView = (bookingTransaction) => {
            let chargedButNotPaidOutToPartner = chargedButNotPaidOutToPartnerStatuses.includes(bookingTransaction.status);
            return (
                <div className="unselectable">
                    <div className="modal-dialog">
                        <div className="modal-content ">
                            <div className="popup-header">
                                {
                                    chargedButNotPaidOutToPartner ?
                                        <h1>Create a Refund For This Charge</h1>
                                        :
                                        <h1>Request a Refund For This Charge</h1>
                                }
                                <button type="button" className="close pull-right"
                                        aria-label="Close"
                                        onClick={this.closeAllDialogs}>
                                    <img alt="" src="../app-images/close.png"/>
                                </button>
                            </div>


                            <AddRefundTransactionForm
                                display="popup"
                                bookingTransaction={bookingTransaction}
                                chargedButNotPaidOutToPartner={chargedButNotPaidOutToPartner}
                                closeSubViewHandler={this.closeAllDialogs}
                                addRefundTransactionCompleted={this.addRefundTransactionCompleted}
                            />
                        </div>
                    </div>
                </div>
            )
        };
        let     INVOICE_ACTIONS = [
            {
                displayValue: 'View Invoice',
                action: this.viewInvoice
            },
            {
                displayValue: 'View Inventory Log',
                action: this.viewInventoryLog,
            },
            {
                displayValue: 'Add Refund Credit...',
                action: this.showAddRefundCreditView,
                shouldShowAction: (transaction) => {
                    return transaction.status === 'CHARGE_PENDING';
                }
            },
            {
                displayValue: 'Put Payout On Hold',
                action: this.putPayoutOnHold,
                shouldShowAction: (transaction) => {
                    let refundableStatus = [
                        'PAYMENT_PENDING',
                        'PAYMENT_SUCCEEDED',
                        'SECURSPACE_PAYOUT_PENDING',
                        'SECURSPACE_PAYOUT_SUCCEEDED',
                        'SECURSPACE_PAYOUT_FAILED',
                        'SECURSPACE_PAYOUT_CANCELED',
                        'SUPPLIER_PAYOUT_FAILED_SECURSPACE_FEE_PAYOUT_SUCCEEDED',
                        'SUPPLIER_PAYOUT_FAILED'
                    ].includes(transaction.status);

                    let refundableType = ![
                        'BOOKING_CHARGE',
                        'DATE_ADJUST_CHARGE',
                        'ADD_SPACE_CHARGE',
                        'OVERAGE_CHARGE',
                        'DAILY_OVERAGE_CHARGE',
                        'OVERSTAY_CHARGE'
                    ].includes(transaction.type);

                    return refundableStatus && refundableType && !transaction.supplierPayoutOnHold;
                }
            },
            {
                displayValue: 'Take Payout Off Hold',
                action: this.takePayoutOffHold,
                shouldShowAction: (transaction) => {
                    let refundableStatus = [
                        'PAYMENT_PENDING',
                        'PAYMENT_SUCCEEDED',
                        'SECURSPACE_PAYOUT_PENDING',
                        'SECURSPACE_PAYOUT_SUCCEEDED',
                        'SECURSPACE_PAYOUT_FAILED',
                        'SECURSPACE_PAYOUT_CANCELED',
                        'SUPPLIER_PAYOUT_FAILED_SECURSPACE_FEE_PAYOUT_SUCCEEDED',
                        'SUPPLIER_PAYOUT_FAILED'
                    ].includes(transaction.status);

                    let refundableType = ![
                        'BOOKING_CHARGE',
                        'DATE_ADJUST_CHARGE',
                        'ADD_SPACE_CHARGE',
                        'OVERAGE_CHARGE',
                        'DAILY_OVERAGE_CHARGE',
                        'OVERSTAY_CHARGE'
                    ].includes(transaction.type);

                    return refundableStatus && refundableType && transaction.supplierPayoutOnHold;
                }
            },
            {
                displayValue: 'Retry Failed Payment',
                action: this.retryPayment,
                shouldShowAction: (transaction) => {
                    return transaction.status === 'PAYMENT_FAILED';
                }
            },
            {
                displayValue: 'Charge Invoice',
                action: this.retryPayment,
                shouldShowAction: (transaction) => {
                    return transaction.status === 'CHARGE_PENDING';
                }
            }
        ];
        if (["lance@secur.space", "jocelyn@secur.space", "adam@secur.space", "chelsey@secur.space",
            "bobby@secur.space", "emily@secur.space", "ebufler@envasetechnologies.com"].includes(this.props.account.username)) {
            INVOICE_ACTIONS.push(
                {
                    displayValue: 'Refund...',
                    action: this.showAddRefundTransactionView,
                    shouldShowAction: (transaction) => {
                        let refundableStatus = [
                            'PAYMENT_PENDING',
                            'PAYMENT_SUCCEEDED',
                            'SECURSPACE_PAYOUT_PENDING',
                            'SECURSPACE_PAYOUT_SUCCEEDED',
                            'SECURSPACE_PAYOUT_FAILED',
                            'SECURSPACE_PAYOUT_CANCELED',
                            'SUPPLIER_PAYOUT_FAILED_SECURSPACE_FEE_PAYOUT_SUCCEEDED',
                            'SUPPLIER_PAYOUT_FAILED'
                        ].includes(transaction.status);

                        return refundableStatus &&  transaction.transferType === 'CHARGE';
                    }
                },
                {
                    displayValue: 'Request Refund...',
                    action: this.showAddRefundTransactionView,
                    shouldShowAction: (transaction) => {
                        let refundableStatus = [
                            'SUPPLIER_PAYOUT_PENDING',
                            'SUPPLIER_PAYOUT_ON_HOLD',
                            'SUPPLIER_PAYOUT_SUCCEEDED',
                            'SUPPLIER_PAYOUT_SUCCEEDED_SECURSPACE_FEE_PAYOUT_FAILED'
                        ].includes(transaction.status);

                        return refundableStatus && transaction.transferType === 'CHARGE';
                    }
                }
            )
        }
        if (["lance@secur.space", "jocelyn@secur.space", "adam@secur.space",
            "chelsey@secur.space", "bobby@secur.space", "ebufler@envasetechnologies.com", "emily@secur.space"].includes(this.props.account.username)) {
            INVOICE_ACTIONS.push(
                {
                    displayValue: 'Complete Refund (Deduct From Next Payout)',
                    action: (item) => {
                        this.completeRefund(item, true);
                    },
                    shouldShowAction: (transaction) => {
                        return transaction.status === 'REFUND_REQUESTED';
                    }
                },
                {
                    displayValue: 'Complete Refund (DO NOT Deduct From Next Payout)',
                    action: (item) => {
                        this.completeRefund(item, false);
                    },
                    shouldShowAction: (transaction) => {
                        return transaction.status === 'REFUND_REQUESTED';
                    }
                },
                {
                    displayValue: 'Deny Refund',
                    action: this.denyRefund,
                    shouldShowAction: (transaction) => {
                        return transaction.status === 'REFUND_REQUESTED';
                    }
                },
                {
                    displayValue: 'Include Refund In Payout',
                    action: this.toggleIncludeRefundInPayout,
                    shouldShowAction: (transaction) => {
                        return transaction.transferType === 'REFUND' &&
                            !transaction.includeRefundInPayout &&
                            !DONT_SHOW_INCLUDE_IN_PAYOUT_STATUSES.includes(transaction.status);
                    }
                },
                {
                    displayValue: 'Exclude Refund From Payout',
                    action: this.toggleIncludeRefundInPayout,
                    shouldShowAction: (transaction) => {
                        return transaction.transferType === 'REFUND' &&
                            transaction.includeRefundInPayout &&
                            !DONT_SHOW_INCLUDE_IN_PAYOUT_STATUSES.includes(transaction.status);
                    }
                }
            )
        }

        return (
            <div className="h-100">
                {this.state.addRefundCreditTransaction ? addRefundCreditView(this.state.addRefundCreditTransaction.transactionId) : ''}
                {this.state.addRefundTransaction ? addRefundTransactionView(this.state.addRefundTransaction) : ''}
                <AccountReport title="Invoices"
                               data={this.state.bookingTransactions}
                               dateField="serviceStartDate"
                               initialSearchText={this.state.initialSearchText}
                               defaultSortBy="transactionNumber"
                               defaultSortByDirection="DESC"
                               defaultDaysInDateRange={30}
                               visibleRecordBatchSize={50}
                               reportFields={[
                                   {
                                       label: "INVOICE NUMBER",
                                       name: "transactionNumber",
                                       groupable: false
                                   },
                                   {
                                       label: "SERVICE DATES",
                                       name: "serviceDates"
                                   },
                                   {
                                       label: "CUSTOMER AMOUNT",
                                       name: "buyerAmount",
                                       formatter: (value) => {
                                           return formatCurrencyValue(value);
                                       }
                                   },
                                   {
                                       label: "PAYMENT PROCESSOR AMOUNT",
                                       name: "paymentProcessorFees",
                                       formatter: (value) => {
                                           return formatCurrencyValue(value);
                                       }
                                   },
                                   {
                                       label: "PARTNER AMOUNT",
                                       name: "supplierAmount",
                                       formatter: (value) => {
                                           return formatCurrencyValue(value);
                                       }
                                   },
                                   {
                                       label: "BOOKING STATE",
                                       name: "locationState"
                                   },
                                   {
                                       label: "SECURSPACE AMOUNT",
                                       name: "securspaceFees",
                                       formatter: (value) => {
                                           return formatCurrencyValue(value);
                                       }
                                   },
                                   {
                                       label: "CHARGE TYPE",
                                       name: "transactionType",
                                       formatter: (type) => {
                                           return type === 'BOOKING_CHARGE' ?
                                               "Booking Payment"
                                               :
                                               type === 'CANCELLATION_REFUND' ?
                                                   "Cancellation Refund"
                                                   :
                                                   type === 'OVERAGE_CHARGE' ?
                                                       "Overage Payment"
                                                       :
                                                       type === 'DATE_ADJUST_CHARGE' ?
                                                           "Date Adjust Payment"
                                                           :
                                                           type === 'DATE_ADJUST_REFUND' ?
                                                               "Date Adjust Refund"
                                                               :
                                                               type === 'OVERSTAY_CHARGE' ?
                                                                   "Overstay Payment"
                                                                   :
                                                                   type === 'ADD_SPACE_CHARGE' ?
                                                                       "Add Space Charge"
                                                                       :
                                                                       type === 'SPACE_REMOVED_REFUND' ?
                                                                           "Space Removed Refund"
                                                                           :
                                                                           type === 'DAILY_OVERAGE_CHARGE' ?
                                                                               "Daily Overage Payment"
                                                                               :
                                                                               type;
                                       }
                                   },
                                   {
                                       label: "INVOICE CREATED",
                                       name: "createdOn"
                                   },
                                   {
                                       label: "PAYMENT TYPE",
                                       name: "paymentType"
                                   },
                                   {
                                       label: "PAYMENT INITIATED",
                                       name: "paymentCreatedOn"
                                   },
                                   {
                                       label: "PAYMENT COMPLETED",
                                       name: "paymentCompletedOn"
                                   },
                                   {
                                       label: "PAYOUT INITIATED",
                                       name: "payoutCreatedOn"
                                   },
                                   {
                                       label: "PAYOUT COMPLETED",
                                       name: "payoutCompletedOn"
                                   },
                                   {
                                       label: "CUSTOMER",
                                       name: "buyerCompanyName"
                                   },
                                   {
                                       label: "LOCATION",
                                       name: "locationName"
                                   },
                                   {
                                       label: "PARTNER",
                                       name: "supplierCompanyName"
                                   },
                                   {
                                       label: "BOOKING",
                                       name: "bookingNumber",
                                       link: (invoice) => {
                                           return (
                                               <NavLink to={{
                                                   pathname: '/admin-bookings',
                                                   search: "bookingNumber=" + invoice.bookingNumber
                                               }}>
                                                   {invoice.bookingNumber}
                                               </NavLink>
                                           );
                                       }
                                   },
                                   {
                                       label: "SPACES",
                                       name: "numberOfSpaces"
                                   },
                                   {
                                       label: "STATUS",
                                       name: "status",
                                       formatter: getDisplayValue
                                   },
                                   {
                                       label: "PAYOUT ON HOLD",
                                       name: "supplierPayoutOnHold",
                                       formatter: (value) => {
                                           return value ? "True"  : "False";
                                       }
                                   },
                                   {
                                       label: "INCLUDE REFUND IN PAYOUT",
                                       name: "includeRefundInPayout",
                                       formatter: (value) => {
                                           return value ? "True"  : "False";
                                       },
                                       shouldShowField: item => item.transferType === 'REFUND'
                                   },
                                   {
                                       label: "BOOKING CREATED ON",
                                       name: "bookingCreatedOn",
                                       formatter: (value) => {
                                           return moment(new Date(value)).format('MM/DD/YYYY hh:mm A');
                                       }
                                   },
                                   {
                                       label: "BOOKING CREATED BY",
                                       name: "bookingCreatedBy"
                                   },
                                   {
                                       label: "REFUND REQUESTED BY",
                                       name: "refundRequestedBy"
                                   },
                                   {
                                       label: "REFUND REASON",
                                       name: "reasonForRefund"
                                   }
                               ]}
                               actionList={INVOICE_ACTIONS}
                               groupSummaryFields={[
                                   {
                                       label: "Customer Charges",
                                       name: "buyerAmount"
                                   },
                                   {
                                       label: "Payment Processor Fees",
                                       name: "paymentProcessorFees"
                                   },
                                   {
                                       label: "Partner Payouts",
                                       name: "supplierAmount"
                                   },
                                   {
                                       label: "SecurSpace Fees",
                                       name: "securspaceFees"
                                   }
                               ]}
                               account={this.state.account}
                />
            </div>
        )
    }
}

