import React, {Component} from 'react';
import {formatCurrencyValue} from "../util/PaymentUtils";
import AccountReport from "./AccountReport";
import getDisplayValue from "../components/BuyerTransactionStatus";
import URLUtils from "../util/URLUtils";
import Busy from "../components/Busy";
import {toast} from "react-toastify";
import {createLogoutOnFailureHandler} from "../util/LogoutUtil";

const $ = window.$;

class BuyerInvoicesReport extends Component {
    constructor(props) {
        super(props);

        let initialSearchText = URLUtils.getQueryVariable('invoiceNumber');
        if (!initialSearchText) {
            initialSearchText = '';
        }

        this.state = {
            account: this.props.account,
            initialSearchText: initialSearchText
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.account !== this.state.account) {
            this.setState({account: nextProps.account});
        }
    }

    viewInvoice = item => {

        if (item) {
            window.open("api/invoices/" + item.transactionId);
        }

    };

    viewInventoryLog = item => {
        if (item) {
            window.open('api/overage-daily-report/' + item.transactionId);
        }
    };

    refreshPaymentStatus = (item) => {
        Busy.set(true);
        $.ajax({
            url: '/api/booking-transaction/' + item.transactionId + '/refresh-payment-status',
            data: JSON.stringify({}),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            success: () => {
                Busy.set(false);
                toast.success("Successfully refreshed payment status!");
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: (jqXHR) => {
                Busy.set(false);
                toast.error("Failed to refresh payment status");
            }
        });
    };

    render() {
        return (
            <div className="flex h-100">
            <AccountReport title="Invoices"
                           getReportDataUrl={(account) => `api/buyers/${account.id}/invoices`}
                           defaultGroupBy="supplierCompanyName"
                           defaultSortBy="serviceStartDate"
                           defaultDaysInDateRange={30}
                           visibleRecordBatchSize={20}
                           criteriaField="locationName"
                           dateField="serviceStartDate"
                           initialSearchText={this.state.initialSearchText}
                           reportFields={[
                               {
                                   label: "INVOICE NUMBER",
                                   name: "transactionNumber",
                                   groupable: false
                               },
                               {
                                   label: "AMOUNT",
                                   name:  "buyerAmount",
                                   formatter:  (value) => {
                                       return formatCurrencyValue(value);
                                   },
                                   groupable: false
                               },
                               {
                                   label: "PAYMENT TYPE",
                                   name:  "paymentType",
                                   groupable: false,
                                   searchable: false
                               },
                               {
                                   label: "PAYMENT METHOD",
                                   name:  "paymentMethodDescription"
                               },
                               {
                                   label: "INVOICE TYPE",
                                   name:  "transactionType",
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
                                   label: "SPACES",
                                   name:  "numberOfSpaces",
                                   groupable: false
                               },
                               {
                                   label: "SERVICE DATES",
                                   name:  "serviceDates",
                                   groupable: false
                               },
                               {
                                   label: "INVOICE CREATED",
                                   name: "createdOn"
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
                                   label: "STATUS",
                                   name:  "status",
                                   formatter: (value) => {
                                       return getDisplayValue(value);
                                   }
                               },
                               {
                                   label: "BOOKING",
                                   name:  "bookingNumber"
                               },
                               {
                                   label: "LOCATION",
                                   name:  "locationName"
                               },
                               {
                                   label: "PARTNER",
                                   name:  "supplierCompanyName"
                               }
                           ]}
                           account={this.state.account}
                           actionList={
                               [
                                   {
                                       displayValue: 'View Invoice',
                                       action: this.viewInvoice
                                   },
                                   {
                                       displayValue: 'View History',
                                       action: this.viewInventoryLog,
                                   },
                                   {
                                       displayValue: 'Refresh Payment Status',
                                       action: this.refreshPaymentStatus,
                                       shouldShowAction: (transaction) => {
                                           return transaction.status === 'PAYMENT_PENDING';
                                       }
                                   }
                               ]
                           }
            />

            </div>
                )
    }
}

export default BuyerInvoicesReport;
