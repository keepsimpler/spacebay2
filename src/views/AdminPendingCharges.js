import React, {Component} from 'react';
import {formatCurrencyValue} from "../util/PaymentUtils";
import AccountReport from "./AccountReport";
import Busy from "../components/Busy";
import {createLogoutOnFailureHandler} from "../util/LogoutUtil";
import {toast} from "react-toastify";

const $ = window.$;

export default class AdminPendingCharges extends Component {
    constructor(props) {
        super(props);

        this.state = {
            account: this.props.account,
            pendingCharges: [],
            selectedCharge: ''
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
                url: `api/admins/pending-charges`,
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
        this.setState({pendingCharges: data});
    };

    handleFailure = data => {
        Busy.set(false);
    };

    handlePanelCloseEvent = () => {
        this.setState({selectedCharge: ''});
    };

    //Need to fix for charges
    payOutGroupOfItems = items => {

        let transactionArrays = items[1].map(item => item.transactions.map(trans => trans.bookingTransactionId));
        let transactionIds = [].concat(...transactionArrays);

        this.charge(transactionIds, true);
    };

    charge = item => {

        if (item) {

            Busy.set(true);

            $.ajax({
                url: `/api/admins/pending-charges`,
                type: 'POST',
                contentType: 'application/json; charset=UTF-8',
                success: (data) => {
                    Busy.set(false);
                    toast.success("Successfully charged invoice!");
                    this.loadData(this.state.account);
                },
                statusCode: {
                    401: createLogoutOnFailureHandler(this.props.handleLogout)
                },
                error: (jqXHR, error, ex) => {
                    Busy.set(false);
                    toast.error("Error:  " + AdminPendingCharges.getErrorMessage(jqXHR));
                },
                data: JSON.stringify(
                    {
                        transactionId: item.transactionId
                    }
                )
            });
        }

    };

    static getErrorMessage(jqXHR) {
        return jqXHR.responseJSON ? jqXHR.responseJSON.message : "Internal Server Error";
    }

    flatten = (flat, toFlatten) => {
        return flat.concat(Array.isArray(toFlatten) ? this.flatten(toFlatten) : toFlatten);
    };


    render() {

        return (
            <AccountReport title="Pending Charges"
                           reportFields={[
                               {
                                   label: "INVOICE NUMBER",
                                   name: "transactionNumber",
                               },
                               {
                                   label: "SERVICE DATES",
                                   name: "serviceDates"
                               },
                               {
                                   label: "CHARGE AMOUNT",
                                   name: "chargeAmount",
                                   formatter: formatCurrencyValue,
                                   action: (charge) => {
                                       this.setState({selectedCharge: charge})
                                   }
                               },
                               {
                                   label: "CUSTOMER",
                                   name: "buyerCompanyName"
                               },
                               {
                                   label: "BOOKING NUMBER",
                                   name: "bookingNumber"
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
                                   label: "TYPE",
                                   name: "transactionType"
                               },
                               {
                                   label: "INVOICE CREATED",
                                   name: "createdOn"
                               }
                           ]}
                           defaultGroupBy="buyerCompanyName"
                           defaultSortBy="paymentDate"
                           account={this.state.account}
                           data={this.state.pendingCharges}
                           actionList={
                               [
                                   {
                                       displayValue: 'Charge',
                                       action: (charge) => this.charge(charge)
                                   }

                               ]
                           }
            />
        );
    }
}