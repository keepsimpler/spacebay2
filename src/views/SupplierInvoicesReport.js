import React, {Component} from 'react';
import {formatCurrencyValue} from "../util/PaymentUtils";
import AccountReport from "./AccountReport";
import getDisplayValue from "../components/SupplierTransactionStatus";
import URLUtils from "../util/URLUtils";

class SupplierInvoicesReport extends Component {

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

    render() {
        return (
            <div className="flex h-100">
                <AccountReport title="Invoices"
                               parentMenu="Finances"
                               getReportDataUrl={(account) => `api/suppliers/${account.id}/transactions`}
                               defaultSortBy="transactionNumber"
                               defaultSortByDirection="DESC"
                               defaultDaysInDateRange={30}
                               visibleRecordBatchSize={20}
                               criteriaField="locationName"
                               dateField="serviceStartDate"
                               initialSearchText={this.state.initialSearchText}
                               reportFields={[
                                   {
                                       label: "LOCATION",
                                       name: "locationName"
                                   },
                                   {
                                       label: "CUSTOMER",
                                       name: "buyerCompanyName"
                                   },
                                   {
                                       label: "TYPE",
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
                                       label: "SPACES",
                                       name: "numberOfSpaces",
                                       groupable: false
                                   },
                                   {
                                       label: "AMOUNT",
                                       name: "supplierAmount",
                                       formatter: (value) => {
                                           return formatCurrencyValue(value);
                                       },
                                       groupable: false
                                   },
                                   {
                                       label: "STATUS" ,
                                       name: "status",
                                       formatter: getDisplayValue
                                   },
                                   {
                                       label: "SERVICE DATES",
                                       name: "serviceDates",
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
                                       label: "PAYOUT INITIATED",
                                       name: "payoutCreatedOn"
                                   },
                                   {
                                       label: "PAYOUT COMPLETED",
                                       name: "payoutCompletedOn"
                                   },
                                   {
                                       label: "INVOICE NUMBER",
                                       name: "transactionNumber",
                                       groupable: false
                                   },
                                   {
                                       label: "PAYMENT TYPE",
                                       name: "paymentType",
                                       groupable: false,
                                       searchable: false
                                   },
                                   {
                                       label: "CHARGED DATE",
                                       name: "createdOn"
                                   },
                                   {
                                       label: "BOOKING",
                                       name: "bookingNumber"
                                   },
                               ]}
                               account={this.state.account}
                />

            </div>
        )
    }
}

export default SupplierInvoicesReport;
