import React, {Component} from 'react';
import {toast} from "react-toastify";
import Busy from "./Busy";
import {createLogoutOnFailureHandler} from "../util/LogoutUtil";
import Select from "./Select";
import {AccountRefOption} from "../controls/AccountRefOption";
import "../css/components/createBookingPanel.css";
import {LocationRefOption} from "../controls/LocationRefOption";
import DatePicker from "./DatePicker";
import EquipmentTypes from "./EquipmentTypes";
import {formatCurrencyValue, parseCurrencyValue, validateCurrencyValue} from "../util/PaymentUtils";
import CheckBox from "./CheckBox";

const $ = window.$;

export default class CreateBookingPanel extends Component {

    constructor(props) {
        super(props);

        this.state = {
            customerAccounts: [],
            selectedCustomerAccount: '',
            partnerLocations: [],
            selectedPartnerLocation: '',
            supplierAccountId: '',
            buyerAccountId: '',
            locationId: '',
            numberOfSpaces: '',
            newBookingStartDate: '',
            assetType: '',
            brokeredBuyerChargedPerOccurrence: '',
            brokeredBuyerOverageRateCharged: '',
            billedBooking: false
        };
    }

    componentDidMount() {
        this.loadAccounts();
        this.loadLocations();
    }

    loadAccounts() {
        $.ajax({
            url: `api/account/references?accountType=Buyer`,
            type: 'GET',
            contentType: 'application/json; charset=UTF-8',
            success: (data) => {
                this.setState({customerAccounts: data.map(accountRef => new AccountRefOption(accountRef))});
                Busy.set(false);
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: (jqXHR) => {
                Busy.set(false);
                let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message ? jqXHR.responseJSON.message.trim() : "" : "";
                toast.error("Failed to load Customer accounts:  " + errorMessage);
            }
        });
    };

    loadLocations() {
        $.ajax({
            url: `api/location`,
            type: 'GET',
            contentType: 'application/json; charset=UTF-8',
            success: (data) => {
                this.setState({partnerLocations: data.map(locationRef => new LocationRefOption(locationRef))});
                Busy.set(false);
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: (jqXHR) => {
                Busy.set(false);
                let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message ? jqXHR.responseJSON.message.trim() : "" : "";
                toast.error("Failed to load Partner locations:  " + errorMessage);
            }
        });
    };

    handleChange = (event) => {
        let name = event.target.name;
        let value = event.target.value;

        //Only allow integers to be typed in the numberOfSpaces field
        if ('numberOfSpaces' === name && (!CreateBookingPanel.isInteger(value) || value > 9999)) {
            return;
        }

        if ('brokeredBuyerChargedPerOccurrence' === name || 'brokeredBuyerOverageRateCharged' === name) {
            if (!validateCurrencyValue(value)) {
                return;
            }
            value = parseCurrencyValue(value);
        }

        this.setState({[name]: value}, this.handleNewBookingUpdated);
    };

    handleNewBookingUpdated = () => {
        this.props.newBookingUpdated({
            buyerAccountId: this.state.selectedCustomerAccount ? this.state.selectedCustomerAccount.value : '',
            locationId: this.state.selectedPartnerLocation ? this.state.selectedPartnerLocation.value : '',
            numberOfSpaces: this.state.numberOfSpaces,
            startDate: this.state.newBookingStartDate,
            assetType: this.state.assetType,
            billedBooking: this.state.billedBooking,
            brokeredBuyerChargedPerOccurrence: this.state.brokeredBuyerChargedPerOccurrence,
            brokeredBuyerOverageRateCharged: this.state.brokeredBuyerOverageRateCharged
        })
    };

    static isInteger(x) {
        return x % 1 === 0;
    }

    getAssetTypeOptions = () => {
        let options = [];
        let equipmentTypes = this.state.selectedPartnerLocation ? this.state.selectedPartnerLocation.equipmentTypes : [];
        if (equipmentTypes) {
            EquipmentTypes.jsonTypes.forEach(function (eqType) {
                if (equipmentTypes.indexOf(eqType.assetType) > -1 && options.indexOf(eqType.assetType) === -1) {
                    options.push(eqType.assetType);
                }
            });
        }
        return options;
    };

    shouldShowCreateBilledBooking() {
        return this.props.account.userType === 'ADMIN' || this.props.account.subscriptionType === "GMS_PRO";
    }

    render() {
        return (
            <div className="ss-create-new-booking-panel">
                <div className="hs-field w100">
                    <label htmlFor="username">SELECT A CUSTOMER</label>
                    <div className="ss-book-space-form-select ss-select">
                        <Select id="selectedCustomerAccount"
                                name="selectedCustomerAccount"
                                handleChange={this.handleChange}
                                className="ss-account-select"
                                selectedOption={this.state.selectedCustomerAccount}
                                placeholder="Choose"
                                options={this.state.customerAccounts}
                                canSearch="1"
                        />
                    </div>
                </div>
                <div className="hs-field w100">
                    <label htmlFor="username">SELECT A LOCATION</label>
                    <div className="ss-book-space-form-select ss-select">
                        <Select id="selectedPartnerLocation"
                                name="selectedPartnerLocation"
                                handleChange={this.handleChange}
                                className="ss-account-select"
                                selectedOption={this.state.selectedPartnerLocation}
                                placeholder="Choose"
                                options={this.state.partnerLocations}
                        />
                    </div>
                </div>
                <div className="hs-field w100">
                    <label>SPACES</label>
                    <input type="text"
                           className="ss-book-space-form-input"
                           id="numberOfSpaces"
                           name="numberOfSpaces"
                           value={this.state.numberOfSpaces}
                           onChange={this.handleChange}
                           title="Enter the number of spaces needed"
                    />
                </div>

                <div className="hs-field w100">
                    <label>START DATE</label>
                    <DatePicker id="newBookingStartDate"
                                name="newBookingStartDate"
                                value={this.state.newBookingStartDate}
                                onChange={this.handleChange}
                                width="120px"
                    />
                </div>

                <div className="hs-field w100">
                    <label>EQUIPMENT TYPE</label>
                    <Select id="assetType"
                            className="ss-book-space-form-select"
                            name="assetType"
                            handleChange={this.handleChange}
                            selectedOption={this.state.assetType}
                            placeholder="Choose"
                            options={this.getAssetTypeOptions()}
                    />
                </div>

                {
                    this.props.allowCreateBilledBooking ?
                        <div>
                            <CheckBox checked={this.state.billedBooking}
                                      onCheck={(value) => this.setState({billedBooking: value}, this.handleNewBookingUpdated)}>
                                Bill Customer Through SecūrSpace?
                            </CheckBox>

                            {
                                this.state.billedBooking ?
                                    <div className="ss-billed-booking-info">
                                        <div className="hs-field w100">
                                            <label>MONTHLY CUSTOMER CHARGE</label>
                                            <input type="text"
                                                   className="ss-book-space-form-input-input"
                                                   id="brokeredBuyerChargedPerOccurrence"
                                                   name="brokeredBuyerChargedPerOccurrence"
                                                   value={formatCurrencyValue(this.state.brokeredBuyerChargedPerOccurrence, true)}
                                                   onChange={this.handleChange}
                                                   style={{
                                                       width: this.state.brokeredBuyerChargedPerOccurrence ? "200px" : "calc(100% - 50px)",
                                                       marginLeft: "0"
                                                   }}
                                                   maxLength={30}
                                                   placeholder={"Enter the Customer charge per month"}
                                            />
                                        </div>

                                        <div className="hs-field w100">
                                            <label>CUSTOMER OVERAGE RATE</label>
                                            <input type="text"
                                                   className="ss-book-space-form-input-input"
                                                   id="brokeredBuyerOverageRateCharged"
                                                   name="brokeredBuyerOverageRateCharged"
                                                   value={formatCurrencyValue(this.state.brokeredBuyerOverageRateCharged, true)}
                                                   onChange={this.handleChange}
                                                   style={{
                                                       width: this.state.brokeredBuyerOverageRateCharged ? "200px" : "calc(100% - 50px)",
                                                       marginLeft: "0"
                                                   }}
                                                   maxLength={30}
                                                   placeholder="Enter the Customer Overage rate"
                                            />
                                        </div>
                                    </div>
                                    :
                                    ""
                            }
                        </div>
                        :
                        ''

                }
            </div>
        )
    }
}

