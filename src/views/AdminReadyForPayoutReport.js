import React, {Component} from 'react';
import {formatCurrencyValue} from "../util/PaymentUtils";
import AccountReport from "./AccountReport";
import Busy from "../components/Busy";
import {createLogoutOnFailureHandler} from "../util/LogoutUtil";

const $ = window.$;

export default class AdminReadyForPayoutReport extends Component {
    constructor(props) {
        super(props);

        this.state = {
            account: this.props.account,
            pendingPayouts: [],
            selectedPayout: ''
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.account !== this.state.account) {
            this.setState({account: nextProps.account});
            this.loadData(nextProps.account);
        }
    }

    componentDidMount() {
        this.loadData(this.props.account);
    }

    loadData = account => {
        if (account && account.id) {
            Busy.set(true);
            $.ajax({
                url: `api/admins/ready-for-payout`,
                type: 'GET',
                contentType: 'application/json; charset=UTF-8',
                success: this.handleSuccess,
                statusCode: {
                    401: createLogoutOnFailureHandler(this.props.handleLogout)
                },
                error: this.handleFailure
            });
        }
    };

    handleSuccess = data => {
        Busy.set(false);
        this.setState({pendingPayouts: data});
    };

    handleFailure = data => {
        Busy.set(false);
    };

    handlePanelCloseEvent = () => {
        this.setState({selectedPayout: ''});
    };

    flatten = (flat, toFlatten) => {
        return flat.concat(Array.isArray(toFlatten) ? this.flatten(toFlatten) : toFlatten);
    };

    render() {
        return (
            <div className="h-100">
                <AccountReport title="Ready For Payout"
                               defaultSortBy="serviceDates"
                               visibleRecordBatchSize={20}
                               criteriaField="supplierCompanyName"
                               dateField="serviceStartDate"
                               defaultDaysInDateRange={180}
                               reportFields={[
                                   {
                                       label: "INVOICE NUMBER",
                                       name:  "invoiceNumber",
                                       groupable: false
                                   },
                                   {
                                       label: "CUSTOMER CHARGE",
                                       name:  "chargedAmount",
                                       formatter:  formatCurrencyValue
                                   },
                                   {
                                       label: "PAYMENT PROCESSOR FEES",
                                       name:  "paymentProcessorFeeAmount",
                                       formatter:  formatCurrencyValue
                                   },
                                   {
                                       label: "SECURSPACE FEES",
                                       name:  "securspaceFeeAmount",
                                       formatter:  formatCurrencyValue
                                   },
                                   {
                                       label: "PARTNER PAYOUT",
                                       name:  "payoutAmount",
                                       formatter:  formatCurrencyValue
                                   },
                                   {
                                       label: "CHARGE TYPE",
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
                                       },
                                       groupable: false
                                   },
                                   {
                                       label: "SERVICE DATES",
                                       name:  "serviceDates",
                                       groupable: false
                                   },
                                   {
                                       label: "PAYMENT DATE",
                                       name:  "paymentDate"
                                   },
                                   {
                                       label: "CUSTOMER",
                                       name:  "buyerCompanyName"
                                   },
                                   {
                                       label: "LOCATION",
                                       name:  "locationName"
                                   },
                                   {
                                       label: "PARTNER",
                                       name: "supplierCompanyName"
                                   },
                                   {
                                       label: "BOOKING NUMBER",
                                       name:  "orderNumber"
                                   }
                               ]}
                               account={this.state.account}
                               data={this.state.pendingPayouts}
                               groupSummaryFields={[
                                   {
                                       label: "Customer Charges",
                                       name:  "chargedAmount"
                                   },
                                   {
                                       label: "Payment Processor Fees",
                                       name: "paymentProcessorFeeAmount"
                                   },
                                   {
                                       label: "SecurSpace Fees",
                                       name: "securspaceFeeAmount"
                                   },
                                   {
                                       label: "Partner Payouts",
                                       name:  "payoutAmount"
                                   }
                               ]}
                />
            </div>
        )
    }
}

