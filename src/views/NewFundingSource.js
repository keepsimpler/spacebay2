import React, {Component} from 'react';
import Select from "../components/Select";
import Error from "../components/Error";
import Success from "../components/Success";
import Busy from "../components/Busy";
import {createLogoutOnFailureHandler} from '../util/LogoutUtil'
import '../css/views/newFundingSource.css';

const $ = window.$;

class NewFundingSource extends Component {
    constructor(props) {
        super(props);

        this.state = {
            newFundingSourceBankAccountType: "",
            newFundingSourceBankRoutingNumber: "",
            newFundingSourceBankAccountNumber: "",
            newFundingSourceBankAccountNumber2: "",
            newFundingSourceAccountNickname: "",
            errorMessage: '',
            updateSuccessful: false
        };
    }

    handleCancel = event => {
        this.props.toggleShowNewFundingSourceDetails();
        document.getElementById("newFundingSourceForm").reset();
        event.preventDefault();
    };

    handleChange = event => {
        this.setState({
            updateSuccessful: false,
            errorMessage: ''
        });

        let name = event.target.name;
        let value = (event.target.type === 'checkbox') ? event.target.checked : event.target.value;

        if (NewFundingSource.fieldRequiredToBeInteger(name) && (!NewFundingSource.isInteger(value) || value > 99999999999999999)) {
            return;
        }

        this.setState({[name]: value});
    };

    static fieldRequiredToBeInteger(name) {
        let fieldRequiredToBeInteger = [
            'newFundingSourceBankRoutingNumber',
            'newFundingSourceBankAccountNumber',
            'newFundingSourceBankAccountNumber2'
        ];
        return fieldRequiredToBeInteger.includes(name);
    }

    static isInteger(x) {
        return x % 1 === 0;
    }

    handleFailure = (jqXHR, textStatus, errorThrown) => {
        Busy.set(false);
        this.setState({
            updateSuccessful: false,
            errorMessage: jqXHR.responseJSON ? jqXHR.responseJSON.message : "Internal Server Error"
        });
    };

    handleSubmit = event => {
        this.setState({errorMessage: ""});
        if (this.validateRequiredFields()) {
            Busy.set(true);
            this.setState({errorMessage: ''});
            $.ajax({
                url: 'api/account/funding-sources',
                type: "POST",
                data: JSON.stringify({
                    id: this.props.account.id,
                    newFundingSourceBankAccountType: this.state.newFundingSourceBankAccountType,
                    newFundingSourceBankRoutingNumber: this.state.newFundingSourceBankRoutingNumber,
                    newFundingSourceBankAccountNumber: this.state.newFundingSourceBankAccountNumber,
                    newFundingSourceBankAccountNumber2: this.state.newFundingSourceBankAccountNumber2,
                    newFundingSourceAccountNickname: this.state.newFundingSourceAccountNickname
                }),
                contentType: 'application/json; charset=UTF-8',
                dataType: "json",
                success: this.handleSuccess,
                statusCode: {
                    401: createLogoutOnFailureHandler(this.props.handleLogout)
                },
                error: this.handleFailure
            });
        }

        event.preventDefault();
    };

    handleSuccess = data => {
        Busy.set(false);
        this.setState({
            updateSuccessful: true,
            errorMessage: ''
        });
        this.props.handleAccountUpdated(data);
        this.props.toggleShowNewFundingSourceDetails(data);
    };

    validateRequiredFields() {
        let accountType = this.state.newFundingSourceBankAccountType;
        let bankRoutingNumber = this.state.newFundingSourceBankRoutingNumber;
        let accountNumber = this.state.newFundingSourceBankAccountNumber;
        let reenteredAccountNumber = this.state.newFundingSourceBankAccountNumber2;
        let accountNickname = this.state.newFundingSourceAccountNickname;

        if (!accountType || accountType === "") {
            this.setState({errorMessage: "Bank account type is required."});
            return false;
        }

        if (!bankRoutingNumber || bankRoutingNumber.trim() === "") {
            this.setState({errorMessage: "Bank routing number is required."});
            return false;
        }

        if (!accountNumber || accountNumber.trim() === "") {
            this.setState({errorMessage: "Bank account number is required."});
            return false;
        }

        if (accountNumber !== reenteredAccountNumber) {
            this.setState({errorMessage: "The entered account numbers do not match."});
            return false;
        }

        if (!accountNickname || accountNickname.trim() === "") {
            this.setState({errorMessage: "Account nickname is required."});
            return false;
        }

        return true;
    }

    render() {
        return (
            <div className="hs-bookings-container">
                <form id="newFundingSourceForm" className="ss-form ss-block for-content" onSubmit={this.preventDefault}>
                    <h3 className="group-title bank-image">Add Bank Account</h3>
                    <fieldset className="ss-stand-alone">
                        <label>ACCOUNT TYPE</label>
                        <Select id="newFundingSourceBankAccountType"
                                name="newFundingSourceBankAccountType"
                                className="ss-bank-account-type"
                                handleChange={this.handleChange}
                                selectedOption={this.state.newFundingSourceBankAccountType}
                                placeholder="Choose"
                                options={["Checking", "Savings"]}
                        />
                    </fieldset>
                    <fieldset className="ss-stand-alone">
                        <label htmlFor="newFundingSourceBankRoutingNumber" >ROUTING NUMBER</label>
                        <input type="text"
                               id="newFundingSourceBankRoutingNumber"
                               name="newFundingSourceBankRoutingNumber"
                               placeholder="Enter your bank's routing number"
                               value={this.state.newFundingSourceBankRoutingNumber}
                               onChange={this.handleChange}
                        />
                    </fieldset>
                    <fieldset className="ss-stand-alone">
                        <label htmlFor="newFundingSourceBankAccountNumber" >ACCOUNT NUMBER</label>
                        <input type="text"
                               id="newFundingSourceBankAccountNumber"
                               name="newFundingSourceBankAccountNumber"
                               placeholder="Enter your bank account number"
                               value={this.state.newFundingSourceBankAccountNumber}
                               onChange={this.handleChange}
                        />
                    </fieldset>
                    <fieldset className="ss-stand-alone">
                        <label htmlFor="newFundingSourceBankAccountNumber2" >RE-ENTER ACCOUNT NUMBER</label>
                        <input type="text"
                               id="newFundingSourceBankAccountNumber2"
                               name="newFundingSourceBankAccountNumber2"
                               placeholder="Re-enter your bank account number"
                               value={this.state.newFundingSourceBankAccountNumber2}
                               onChange={this.handleChange}
                        />
                    </fieldset>
                    <fieldset className="ss-stand-alone">
                        <label htmlFor="newFundingSourceAccountNickname" >ACCOUNT NICKNAME</label>
                        <input type="text"
                               id="newFundingSourceAccountNickname"
                               name="newFundingSourceAccountNickname"
                               placeholder="Enter a nickname for this bank account"
                               value={this.state.newFundingSourceAccountNickname}
                               onChange={this.handleChange}
                        />
                    </fieldset>
                    {this.state.errorMessage ? <Error>{this.state.errorMessage}</Error> : ''}
                    {this.state.updateSuccessful ? <Success>Successfully added bank account!</Success> : ''}
                    <div className="ss-button-container ss-booking-button-container">
                        <button type="button" className="ss-button-danger" onClick={this.handleCancel}>Cancel</button>
                        <button type="button" className="ss-button-primary" onClick={this.handleSubmit}>Save Bank Account</button>
                    </div>
                </form>
            </div>
        );
    }
}

export default NewFundingSource;