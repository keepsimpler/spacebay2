import React, {Component} from 'react';
import {formatCurrencyValue} from "../util/PaymentUtils";
import AccountReport from "./AccountReport";
import SubReport from "./SubReport";

export default class AdminPayoutsReport extends Component {
    constructor(props) {
        super(props);

        this.state = {
            account: this.props.account,
            selectedInvoice: ''
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.account !== this.state.account) {
            this.setState({account: nextProps.account});
        }
    }

    handlePanelCloseEvent = () => {
        this.setState({selectedInvoice: ''});
    };

    render() {
        let mainReport =
            <AccountReport title="Payouts"
                           getReportDataUrl={(account) => `api/admins/invoices`}
                           defaultSortBy="createdOn"
                           defaultSortByDirection="DESC"
                           dateField="createdOn"
                           defaultDaysInDateRange={30}
                           reportFields={[
                               {
                                   label: "GROSS AMOUNT",
                                   name:  "totalTransactionGrossAmount",
                                   formatter:  formatCurrencyValue
                               },
                               {
                                   label: "CUSTOMER AMOUNT",
                                   name:  "totalBuyerAmount",
                                   formatter:  formatCurrencyValue
                               },
                               {
                                   label: "PAYMENT PROCESSOR AMOUNT",
                                   name:  "totalPaymentProcessorFeeAmount",
                                   formatter:  formatCurrencyValue
                               },
                               {
                                   label: "SECURSPACE AMOUNT",
                                   name:  "totalSecurspaceFees",
                                   formatter:  formatCurrencyValue
                               },
                               {
                                   label: "PARTNER AMOUNT",
                                   name:  "totalSupplierAmount",
                                   formatter:  formatCurrencyValue
                               },
                               {
                                   label: "PAYOUT INITIATED",
                                   name:  "createdOn"
                               },
                               {
                                   label: "PAYOUT COMPLETED",
                                   name:  "completedOn"
                               },
                               {
                                   label: "STATUS",
                                   name:  "status",
                                   formatter: (status) => {
                                       return status === 'SUPPLIER_PAYOUT_PENDING' ||
                                       status === 'SUPPLIER_PAYOUT_PENDING_SECURSPACE_FEE_PAYOUT_FAILED' ?
                                           "Pending"
                                           :
                                           status === 'SUPPLIER_PAYOUT_SUCCEEDED' || status === 'SUPPLIER_PAYOUT_SUCCEEDED_SECURSPACE_FEE_PAYOUT_FAILED' ?
                                               "Complete"
                                               :
                                               status === 'SUPPLIER_PAYOUT_FAILED' ||
                                               status === 'SUPPLIER_PAYOUT_FAILED_SECURSPACE_FEE_PAYOUT_PENDING' ||
                                               status === 'SUPPLIER_PAYOUT_FAILED_SECURSPACE_FEE_PAYOUT_SUCCEEDED' ?
                                                   "Failed"
                                                   :
                                                   status === 'SUPPLIER_PAYOUT_ON_HOLD' ?
                                                       "On Hold"
                                                       :
                                                       status;
                                   }
                               },
                               {
                                   label: "PARTNER",
                                   name: "supplierCompanyName"
                               },
                               {
                                   label: "CUSTOMER",
                                   name:  "buyerCompanyName"
                               },
                               {
                                   label: "LOCATION",
                                   name:  "locationName"
                               },
                           ]}
                           groupSummaryFields={[
                               {
                                   label: "Gross Amount",
                                   name: "totalTransactionGrossAmount"
                               },
                               {
                                   label: "Customer Amount",
                                   name:  "totalBuyerAmount"
                               },
                               {
                                   label: "Payment Processor Amount",
                                   name: "totalPaymentProcessorFeeAmount"
                               },
                               {
                                   label: "Securspace Amount",
                                   name:  "totalSecurspaceFees"
                               },
                               {
                                   label: "Partner Amount",
                                   name: "totalSupplierAmount"
                               }
                           ]}
                           account={this.state.account}
                           actionList={
                               [
                                   {
                                       displayValue: 'View Transactions',
                                       action: (invoice) => {
                                           this.setState({selectedInvoice: invoice});
                                       }
                                   }
                               ]
                           }
            />;

        let headingEntries = [
            {
                label: "GROSS AMOUNT",
                value: formatCurrencyValue(this.state.selectedInvoice.totalTransactionGrossAmount)
            },
            {
                label: "CUSTOMER AMOUNT",
                value: formatCurrencyValue(this.state.selectedInvoice.totalBuyerAmount)
            },
            {
                label: "PAYMENT PROCESSOR AMOUNT",
                value: formatCurrencyValue(this.state.selectedInvoice.totalPaymentProcessorFeeAmount)
            },
            {
                label: "SECURSPACE AMOUNT",
                value: formatCurrencyValue(this.state.selectedInvoice.totalSecurspaceFees)
            },
            {
                label: "PARTNER AMOUNT",
                value: formatCurrencyValue(this.state.selectedInvoice.totalSupplierAmount)
            },
            {
                label: "PAYOUT INITIATED",
                value: this.state.selectedInvoice.createdOn
            },
            {
                label: "PAYOUT COMPLETED",
                value: this.state.selectedInvoice.completedOn
            },
            {
                label: "PARTNER",
                value: this.state.selectedInvoice.supplierCompanyName
            },
            {
                label: "CUSTOMER",
                value: this.state.selectedInvoice.buyerCompanyName
            },
            {
                label: "LOCATION",
                value: this.state.selectedInvoice.locationName
            }
        ];

        let listDataUrl = function(selectedInvoice) {
            return `/api/invoices/${selectedInvoice.payoutCorrelationId}/transactions`;
        };

        let transactionsSubReport =
            <SubReport parentRecord={this.state.selectedInvoice}
                       title="Invoices In Payout"
                       heading={
                           <div style={{paddingLeft: "40px", marginTop: "20px", minHeight: "unset"}}>
                               {
                                   headingEntries.map(entry =>
                                       <div style={{marginBottom: "10px"}}>
                                           <div style={{
                                               display: "inline-block",
                                               fontSize: "13px",
                                               fontWeight: "400",
                                               color: "#999999"
                                           }}>{entry.label}:&nbsp;&nbsp;</div>
                                           <div style={{
                                               display: "inline-block",
                                               fontSize: "15px",
                                               fontWeight: "700"
                                           }}>{entry.value}</div>
                                       </div>
                                   )
                               }
                           </div>
                       }
                       getListDataUrl={listDataUrl}
                       columnWidth="230px"
                       labelWidth="230px"
                       subReportFields={[
                           {
                               label: "INVOICE NUMBER",
                               name: "transactionNumber"
                           },
                           {
                               label: "GROSS AMOUNT",
                               name:  "grossAmount",
                               formatter:  formatCurrencyValue
                           },
                           {
                               label: "CUSTOMER AMOUNT",
                               name:  "buyerAmount",
                               formatter:  formatCurrencyValue
                           },                           {
                               label: "PAYMENT PROCESSOR AMOUNT",
                               name:  "paymentProcessorFees",
                               formatter:  formatCurrencyValue
                           },                           {
                               label: "SECURSPACE AMOUNT",
                               name:  "securspaceFees",
                               formatter:  formatCurrencyValue
                           },
                           {
                               label: "PARTNER AMOUNT",
                               name:  "supplierAmount",
                               formatter:  formatCurrencyValue
                           },
                           {
                               label: "SERVICE DATES",
                               name:  "serviceDates"
                           },
                           {
                               label: "CHARGED DATE",
                               name:  "createdOn"
                           },
                           {
                               label: "PAYMENT DATE",
                               name:  "createdOn"
                           },
                           {
                               label: "TYPE",
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
                               label: "BOOKING NUMBER",
                               name:  "bookingNumber"
                           }
                       ]}
                       handlePanelCloseEvent={this.handlePanelCloseEvent}
            />;

        return (
            <div className="h-100">
                {this.state.selectedInvoice ? transactionsSubReport : ""}
                <div style={{"display": this.state.selectedInvoice ? "none" : "block"}} className="h-100">
                    {mainReport}
                </div>
            </div>
        )
    }
}

