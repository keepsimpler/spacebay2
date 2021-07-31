import React, { Component } from 'react'
import StripeService from "../processors/StripeService";
import DwollaService from "../processors/DwollaService";
import BankAccountDetailsForm from "./BankAccountDetailsForm";
import { getErrorMessageForStandardResponse } from "../../../util/NetworkErrorUtil";
import {
    requestToken,
    requestAddDwollaPaymentMethod,
    requestAddStripePaymentMethod
} from "../request/payment-method-requests";
import PropTypes from 'prop-types'
import {BankAccountType} from "../../constants/securspace-constants";
import Busy from "../../Busy";

export default class AddMicroDepositPaymentMethod extends Component {
    static propTypes = {
        authority: PropTypes.shape({
            authorityId: PropTypes.string.isRequired,
            userType: PropTypes.string.isRequired,
            contactEmail: PropTypes.string.isRequired
        }),
        paymentEnvironment: PropTypes.shape({
            dwollaEnv: PropTypes.string.isRequired,
            plaidClientName: PropTypes.string.isRequired,
            plaidEnvironment: PropTypes.string.isRequired,
            plaidPublicKey: PropTypes.string.isRequired,
            platformPublishedKey: PropTypes.string.isRequired
        }),
        bypassDwolla: PropTypes.bool,
        onPaymentMethodAdded: PropTypes.func,
        onCancel: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);

        this.state = {
            errorMsg: null,
            bankAccountDetails: {},
            submitting: false
        }

        this.initializePaymentServices()
    }

    handleServiceError = (err) => {
        Busy.set(false)
        this.setState({errorMsg: getErrorMessageForStandardResponse(err)})
    }

    handleDwollaError = (dwollaErrorMessage) => {
        Busy.set(false)
        this.setState({ errorMsg: dwollaErrorMessage})
    }

    initializePaymentServices = () => {
        const {
            authority: { authorityId, contactEmail, userType },
            paymentEnvironment,
            onPaymentMethodAdded
        } = this.props

        if(!this.stripeService) {
            this.stripeService = new StripeService(
                paymentEnvironment,
                { id: authorityId, userType, email: contactEmail },
                onPaymentMethodAdded,
                this.handleServiceError
            )
        }

        if(!this.dwollaService) {
            this.dwollaService = new DwollaService(paymentEnvironment)
        }
    }

    setBankAccountDetails = (details) => {
        this.setState({
            bankAccountDetails: { ...this.state.bankAccountDetails, ...details }
        })
    }

    onPaymentMethodAddedWrapper = () => {
        Busy.set(false)
        this.props.onPaymentMethodAdded()
    }

    onAddPaymentMethodWithMicroDepositConfirm = () => {
        const { bypassDwolla, authority: { authorityId, userType } } = this.props
        const { bankAccountDetails } = this.state
        const { accountHolderName, accountType, routingNumber, accountNumber, accountNumberVerification } = bankAccountDetails

        let errorMessage = null

        if(accountNumber !== accountNumberVerification) {
            errorMessage = "Re-entered bank account number does not match bank account number"
        } else if(!accountHolderName) {
            errorMessage = "Please enter the name of the account holder"
        } else if(!accountType) {
            errorMessage = "Please select the account type"
        } else if(!routingNumber) {
            errorMessage = "Please enter in the routing number"
        } else if(!accountNumber) {
            errorMessage = "Please enter in the account number"
        } else if(!accountNumberVerification) {
            errorMessage = "Please re-enter your account number"
        }

        if(errorMessage) {
            this.setState({errorMsg: errorMessage})
            return
        }

        const bankAccountLastFour = accountNumber.substring(accountNumber.length - 4, accountNumber.length)
        const isSavings = accountType === BankAccountType.INDIVIDUAL_SAVINGS || accountType === BankAccountType.COMPANY_SAVINGS
        const isIndividual = accountType === BankAccountType.INDIVIDUAL_SAVINGS || accountType === BankAccountType.INDIVIDUAL_CHECKING

        if(bypassDwolla && this.stripeService) {
            Busy.set(true)

            this.stripeService.createStripeToken(
                {
                    routingNumber,
                    accountNumber,
                    accountHolderName,
                    accountHolderType: isIndividual ? 'individual' : 'company'
                },
                (token) => {
                    requestAddStripePaymentMethod(
                        { authorityId, userType, stripeToken: token },
                        this.onPaymentMethodAddedWrapper,
                        this.handleServiceError
                    )
                },
                this.handleServiceError
            )
        } else if (this.dwollaService) {
            Busy.set(true)
            requestToken(
                authorityId,
                userType,
                (token) => {
                    this.dwollaService
                        .createDwollaFundingSource(
                            {
                                authorityId,
                                userType,
                                routingNumber,
                                accountNumber,
                                bankAccountLastFour,
                                token,
                                accountType: isSavings ? "savings" : "checking"
                            },
                            dwollaFundingSourceId => {
                                requestAddDwollaPaymentMethod(
                                    {
                                        authorityId,
                                        userType,
                                        dwollaFundingSourceId
                                    },
                                    this.onPaymentMethodAddedWrapper,
                                    this.handleServiceError
                                )
                            },
                            this.handleDwollaError
                        )
                },
                this.handleServiceError
            )
        }
    }


    render() {
        return (
            <BankAccountDetailsForm
                onChange={this.setBankAccountDetails}
                onCancel={this.props.onCancel}
                onConfirm={this.onAddPaymentMethodWithMicroDepositConfirm}
                containerClassName="bank-account-details-container"
                errorMessage={this.state.errorMsg}
            />
        )
    }

}
