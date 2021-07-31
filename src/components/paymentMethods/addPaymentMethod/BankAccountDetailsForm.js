import React, {Component} from 'react'
import ThirdPartyPartnerDetailsField from "../../thirdPartyManagement/ThirdPartyPartnerDetailsField";
import ModalSelectField from "../fields/ModalSelectField";
import {BankAccountType} from "../../constants/securspace-constants";
import PropTypes from 'prop-types'
import _ from 'underscore'

export default class BankAccountDetailsForm extends Component {

    static propTypes = {
        onChange: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
        onConfirm: PropTypes.func.isRequired,
        containerClassName: PropTypes.string,
        errorMessage: PropTypes.string
    }

    constructor(props) {
        super(props);

        this.state = {
            accountHolderName: "",
            accountType: {},
            routingNumber: "",
            accountNumber: "",
            accountNumberVerification: "",
        }
        this.valueToType = {}
        _.each(BankAccountType, (type) => {
            this.valueToType[type.value] = type
        })
    }

    handleChange = (event) => {
        const name = event.target.name
        let value = event.target.value

        this.setState({[name]: value})
        this.props.onChange({[name]: value})
    }

    handleAccountTypeChange = (value) => {
        this.setState({accountType: this.valueToType[value]})
        this.props.onChange({accountType: this.valueToType[value]})
    }

    render() {
        return (
            <div className={this.props.containerClassName}>
                <h4 className="bank-account-details-header"><b>Enter Bank Account Details</b></h4>
                <div>
                    <ThirdPartyPartnerDetailsField
                        name="accountHolderName"
                        label="ACCOUNT HOLDER FULL NAME"
                        value={this.state.accountHolderName}
                        onChange={this.handleChange}
                        placeholder="Enter the full name of the person who holds this account"
                    />

                    <ModalSelectField
                        label="ACCOUNT TYPE"
                        id="accountType"
                        name="accountType"
                        className=""
                        handleChange={this.handleAccountTypeChange}
                        selectedOption={this.state.accountType}
                        placeholder="Choose"
                        options={[
                            BankAccountType.COMPANY_CHECKING,
                            BankAccountType.COMPANY_SAVINGS,
                            BankAccountType.INDIVIDUAL_CHECKING,
                            BankAccountType.INDIVIDUAL_SAVINGS
                        ]} />

                    <ThirdPartyPartnerDetailsField
                        name="routingNumber"
                        label="ROUTING NUMBER"
                        value={this.state.routingNumber}
                        onChange={this.handleChange}
                        placeholder="Enter your bank's routing number"
                    />

                    <ThirdPartyPartnerDetailsField
                        name="accountNumber"
                        label="ACCOUNT NUMBER"
                        value={this.state.accountNumber}
                        onChange={this.handleChange}
                        placeholder="Enter your bank account number"
                    />

                    <ThirdPartyPartnerDetailsField
                        name="accountNumberVerification"
                        label="RE-ENTER ACCOUNT NUMBER"
                        value={this.state.accountNumberVerification}
                        onChange={this.handleChange}
                        placeholder="Re-enter your bank account number"
                    />
                </div>

                <div className="payment-method-action-modal-prompt-footer bank-account-details-footer">
                    {
                        this.props.errorMessage &&
                        <div className="back-account-details-form-error">
                            <div className="ss-error">{this.props.errorMessage}</div>
                        </div>
                    }
                    <div className="payment-method-action-modal-prompt-btn-container">
                        <div onClick={this.props.onCancel} className="ss-button-secondary payment-method-action-modal-prompt-btn">
                            Back
                        </div>
                        <div onClick={this.props.onConfirm}
                             className="ss-button-primary payment-method-action-modal-prompt-btn payment-method-action-modal-btn-confirm">
                            Next
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
