import React, { Component } from 'react'
import '../css/views/signUp.css'
import '../css/theme/mainContent.css';
import '../css/theme/forms.css';
import '../css/theme/forms-block.css';
import '../css/theme/buttons.css';
import '../css/views/accountConfirmation.css'
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import Error from "../components/Error";
import classNames from 'classnames'
import request from "superagent"
import PropTypes from 'prop-types'
import CheckBox from "../components/CheckBox";
import { GlobalModalContext } from "../context/global-modal-context";

export default class AccountConfirmation extends Component {

    static propTypes = {
        account: PropTypes.object.isRequired,
        onAccountConfirmation: PropTypes.func.isRequired,
        closeModal: PropTypes.func
    }

    static contextType = GlobalModalContext

    constructor(props) {
        super(props);

        const {
            companyName,
            firstName,
            lastName,
            phoneNumber,
            email
        } = this.props.account || {}

        this.state = {
            companyName,
            firstName,
            lastName,
            phoneNumber,
            email,
            password: "",
            confirmPassword: ""
        }
    }

    handleChange = (event) => {
        let name = event.target.name
        let value = event.target.value
        this.setState({[name]: value})
    }

    submit = () => {
        const { id } = this.props.account
        const isNewAccountConfirmation = this.isNewAccountConfirmation()

        let errorMessage

        if(isNewAccountConfirmation) {
            if(!this.state.password) {
                errorMessage = "Please enter a password"
            } else if(this.state.password.length < 8) {
                errorMessage = "Password must be at least 8 characters"
            } else if(this.state.password !== this.state.confirmPassword) {
                errorMessage = "Passwords don't match"
            }
        }

        if(!this.state.agreementAccepted) {
            errorMessage = "Please accept the Terms of Service"
        }


        if(errorMessage) {
            this.setState({errorMessage})
            return
        }

        let url = `/api/account/confirm-account/${id}`

        if(!isNewAccountConfirmation) {
            url = `/api/account/confirm-tos/${id}`
        }

        request
            .post(url)
            .send({ ...this.state, isNewAccountConfirmation })
            .then(this.handleSuccessfulConfirmation, this.handleFailedConfimation)
    }

    handleSuccessfulConfirmation = () => {
        if(this.props.closeModal) {
            this.props.closeModal();
        }

        this.props.onAccountConfirmation();
    }

    handleFailedConfimation = ({ response }) => {
        const { body } = response || {}

        if(response) {
            this.setState({errorMessage: body.message})
        } else {
            this.setState({errorMessage: "There was an error completing your request possibly due to a network connectivity issue"})
        }
    }

    isNewAccountConfirmation = () => {
        const { thirdParty, hasAcceptedAnyTos } = this.props.account
        const { companyName } = thirdParty || {}
        return companyName && !hasAcceptedAnyTos
    }

    getHeaderText = () => {
        if(this.isNewAccountConfirmation()) {
            return "Confirm SecūrSpace Account Information"
        } else {
            return "SecūrSpace Terms and Conditions Acknowledgement"
        }
    }

    render() {

        const globalModalContext = this.context
        const { showTermsModal, showPrivacyModal } = globalModalContext

        const { thirdParty } = this.props.account
        const { companyName } = thirdParty || {}

        const isNewAccountConfirmation = this.isNewAccountConfirmation()

        return (
            <div className={`account-confirmation ${this.props.className}`}>
                <div className="popup-header account-confirmation-header">
                    <h1>{this.getHeaderText()}</h1>
                </div>
                <div className="login-form account-confirmation-form">
                    <div className={classNames("account-confirmation-form-welcome-text", { "hidden" : !isNewAccountConfirmation })}>
                        <span className="company-highlight">SecūrSpace</span> and&nbsp;
                        <span className="company-highlight">{companyName}</span> have teamed up to bring the SecūrSpace
                        platform to you. SecūrSpace is an online marketplace that connects companies and people looking
                        for parking and storage options to those with dedicated or excess capacity.

                        <br />
                        <br />

                        Your account has been created by <span className="company-highlight">{companyName}</span>.
                        Complete the account by creating a password to begin finding safe and secure parking and
                        storage wherever you are.
                    </div>

                    <div className={classNames("account-confirmation-form-welcome-text", { "hidden": isNewAccountConfirmation})}>
                        We have made updates to our Privacy Policy and Terms and Conditions. Please review the changes
                        before continuing.
                    </div>

                    <AccountConfirmationField
                        label="EMAIL"
                        type="email"
                        name="email"
                        value={this.state.email}
                        disabled={true}
                        hidden={!isNewAccountConfirmation}
                    />

                    <AccountConfirmationField
                        label="PASSWORD"
                        type="password"
                        name="password"
                        value={this.state.password}
                        onChange={this.handleChange}
                        autoComplete="new-password"
                        placeholder="Create a password with at least 8 characters"
                        hidden={!isNewAccountConfirmation}
                    />


                    <AccountConfirmationField
                        label="CONFIRM"
                        type="password"
                        name="confirmPassword"
                        value={this.state.confirmPassword}
                        onChange={this.handleChange}
                        autoComplete="new-password"
                        placeholder="Repeat your password"
                        hidden={!isNewAccountConfirmation}
                    />

                    <fieldset>
                        <div className="agreement-container">
                            <div className="agreement-checkbox-container">
                                <CheckBox checked={this.state.agreementAccepted}
                                          onCheck={(value) => this.setState({agreementAccepted: value})}
                                />
                            </div>
                            <div className="signup-terms">
                                I agree to the SecūrSpace &nbsp;
                                <span className="pointer" onClick={() => showTermsModal(2)}>Terms of Use</span>
                                &nbsp;and&nbsp;
                                <span className="pointer" onClick={() => showPrivacyModal(2)}>Privacy Policy</span>,
                                as well as our partner <a
                                href="https://www.dwolla.com/legal/tos/"
                                target="_blank"
                                rel="noopener noreferrer">Dwolla's Terms of Service</a> and <a href="https://www.dwolla.com/legal/privacy/"
                                                                                               target="_blank"
                                                                                               rel="noopener noreferrer">Privacy Policy</a>
                            </div>
                        </div>
                    </fieldset>

                    {
                        this.state.errorMessage &&
                        <fieldset>
                            <Error>{this.state.errorMessage}</Error>
                        </fieldset>
                    }

                    <fieldset className="account-confirmation-form-submit-btn">
                        <div className="orange-button ss-action-button" onClick={this.submit}>
                            Agree and continue
                        </div>
                    </fieldset>
                </div>
            </div>
        )
    }
}

class AccountConfirmationField extends Component {
    render() {
        return (
            <fieldset className={classNames("border-bottom", { "hidden" : this.props.hidden})}>
                <label>{this.props.label}</label>
                <input
                    {...this.props}
                    value={this.props.value || ""}
                />
                {
                    this.props.type === 'password' &&
                    <div className="meter">
                        <PasswordStrengthMeter password={this.props.value} />
                    </div>

                }
            </fieldset>
        )
    }
}
