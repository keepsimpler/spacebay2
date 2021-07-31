import '../css/theme/mainContent.css';
import '../css/theme/forms.css';
import '../css/theme/forms-block.css';
import '../css/theme/buttons.css';
import '../css/views/pendingPayouts.css';
import React, { Component } from 'react';
import { formatCurrencyValue } from "../util/PaymentUtils";
import AccountReport from "./AccountReport";
import Busy from "../components/Busy";
import { createLogoutOnFailureHandler } from "../util/LogoutUtil";
import Error from "../components/Error";
import { UserType } from '../components/constants/securspace-constants';

const $ = window.$;

class SupplierReadyForPayoutReport extends Component {
    constructor(props) {
        super(props);

        this.state = {
            account: this.props.account,
            pendingPayouts: [],
            groupToPayout: '',
            createPayoutSuccess: '',
            createPayoutErrorMessage: ''
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (typeof nextProps.account.id !== 'undefined' && nextProps.account !== this.state.account) {
            this.setState({ account: nextProps.account });
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
                url: `api/suppliers/${account.id}/ready-for-payout`,
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
        this.setState({ pendingPayouts: data });
    };

    handleFailure = data => {
        Busy.set(false);
    };

    payOutGroupOfItems = () => {
        let transactionIds = this.state.groupToPayout[1].map(item => item.transaction.bookingTransactionId);

        this.payOut(transactionIds, true);
    };

    payOut = (transactionIds, isGrouped) => {

        Busy.set(true);
        $.ajax({
            url: `api/suppliers/create-payouts`,
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            success: (data) => {
                Busy.set(false);
                this.setState({
                    createPayoutSuccess: true,
                    createPayoutErrorMessage: ''
                });
                this.loadData(this.state.account);
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: (jqXHR, textStatus, errorThrown) => {
                Busy.set(false);

                let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "";
                errorMessage = errorMessage ? errorMessage.trim() : errorMessage;
                this.setState({
                    createPayoutSuccess: false,
                    createPayoutErrorMessage: errorMessage ? errorMessage : "An error occurred while creating this payout.  The payout was not created."
                });
            },
            data: JSON.stringify(
                {
                    supplierAccountId: this.state.account.id,
                    transactionIds: transactionIds,
                    groupForSupplier: isGrouped
                }
            )
        });
    };

    flatten = (flat, toFlatten) => {
        return flat.concat(Array.isArray(toFlatten) ? this.flatten(toFlatten) : toFlatten);
    };

    sum(items, prop) {
        return items.reduce((a, b) => {
            return a + b[prop];
        }, 0);
    }

    render() {
        return (
            <div className="flex h-100">
                {
                    <AccountReport title="Ready For Payout"
                        parentMenu="Finances"
                        defaultSortBy="invoiceNumber"
                        defaultSortByDirection="DESC"
                        visibleRecordBatchSize={20}
                        criteriaField="locationName"
                        defaultGroupBy="locationName"
                        dateField={this.state.account.userType === UserType.ADMIN ? "serviceStartDate" : ""}
                        defaultDaysInDateRange={180}
                        reportFields={[
                            {
                                label: "INVOICE NUMBER",
                                name: "invoiceNumber",
                                groupable: false,
                                searchable: false
                            },
                            {
                                label: "PAYOUT AMOUNT",
                                name: "payoutAmount",
                                formatter: formatCurrencyValue,
                                groupable: false,
                                searchable: false
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
                                },
                                groupable: false,
                                searchable: false
                            },
                            {
                                label: "SERVICE DATES",
                                name: "serviceDates",
                                groupable: false,
                                searchable: false
                            },
                            {
                                label: "PAYMENT DATE",
                                name: "paymentDate",
                                groupable: false,
                                searchable: false
                            },
                            {
                                label: "CUSTOMER",
                                name: "buyerCompanyName",
                                groupable: false,
                            },
                            {
                                label: "LOCATION",
                                name: "locationName"
                            },
                            {
                                label: "BOOKING NUMBER",
                                name: "orderNumber",
                                groupable: false,

                            }
                        ]}
                        groupSummaryFields={[
                            {
                                label: "Payout Amount",
                                name: "payoutAmount"
                            }
                        ]}
                        account={this.state.account}
                        data={this.state.pendingPayouts}
                        payOutGroupFunction={(items) => this.setState({ groupToPayout: items })}
                    />
                }
                {
                    this.state.groupToPayout ?
                        <div className="unselectable">
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="popup-header">
                                        <h1>Initiate Payout</h1>
                                        <button type="button" className="close pull-right"
                                            aria-label="Close"
                                            onClick={() => this.setState({
                                                groupToPayout: '',
                                                createPayoutSuccess: '',
                                                createPayoutErrorMessage: ''
                                            })}>
                                            <img alt="" src="../app-images/close.png" />
                                        </button>
                                    </div>
                                    <form className="ss-form ss-block">

                                        {
                                            this.state.createPayoutSuccess ?
                                                <div>
                                                    <div className="modal-body">
                                                        <h4 className="ss-summary">PAYOUT CREATED SUCCESSFULLY</h4>
                                                    </div>
                                                    <div className="modal-footer">
                                                        <div className="table text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => this.setState({
                                                                    groupToPayout: '',
                                                                    createPayoutSuccess: '',
                                                                    createPayoutErrorMessage: ''
                                                                })}
                                                                className="ss-button-primary">Done
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                :
                                                <div>
                                                    <div className="modal-body">
                                                        <h4 className="ss-summary">
                                                            Are you sure you want to initiate a payout
                                                            of {formatCurrencyValue(this.sum(this.state.groupToPayout[1], 'payoutAmount'))}?
                                                        </h4>
                                                        {
                                                            this.state.createPayoutErrorMessage ?
                                                                <Error>{this.state.createPayoutErrorMessage}</Error> : ''
                                                        }
                                                    </div>
                                                    <div className="modal-footer">
                                                        <div className="table text-center">

                                                            <button type="button"
                                                                onClick={() => this.setState({
                                                                    groupToPayout: ''
                                                                })}
                                                                className="ss-button-secondary">No
                                                            </button>
                                                            <button type="button"
                                                                onClick={this.payOutGroupOfItems}
                                                                className="ss-button-primary">Yes
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                        }
                                    </form>
                                </div>
                            </div>
                        </div>
                        :
                        ''
                }
            </div>
        )
    }
}

export default SupplierReadyForPayoutReport;
