import React, {Component} from 'react'
import { PaymentType, VerificationType } from "../../constants/securspace-constants";
import SecurSpaceModal from "../../common/SecurSpaceModal";
import StripeService from "../processors/StripeService";
import PlaidService from "../processors/PlaidService";
import DwollaService from "../processors/DwollaService";
import AddPaymentMethodSetup from "./AddPaymentMethodSetup";
import AddMicroDepositPaymentMethod from "./AddMicroDepositPaymentMethod";
import PropTypes from 'prop-types'

import 'css/add-payment-method-modal.css'
import 'css/payment-method-action-modal.css'

import { getErrorMessageForStandardResponse } from "../../../util/NetworkErrorUtil";

export default class AddPaymentMethodModal extends Component {
    static propTypes = {
        isOpen: PropTypes.bool.isRequired,
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
        closeModal: PropTypes.func.isRequired,
        bypassDwolla: PropTypes.bool,
        onPaymentMethodAdded: PropTypes.func,
        disablePaymentMethod: PropTypes.string
    }

    constructor(props) {
        super(props);

        const { disablePaymentMethod } = props

        let startingPaymentType = PaymentType.CARD

        if(disablePaymentMethod) {
            startingPaymentType = disablePaymentMethod === PaymentType.CARD ? PaymentType.ACH : PaymentType.CARD
        }

        this.state = {
            errorMsg: null,
            paymentType: startingPaymentType,
            verificationType: VerificationType.INSTANT,
            showAddMicroDepositPaymentMethod: false,
        }

        this.initializePaymentServices()
    }

    initializePaymentServices = () => {
        this.initializeStripeService()
        this.initializePlaidService()
        this.initializeDwollaService()
    }

    componentWillUnmount() {
        if(this.stripeService) {
            this.stripeService.closeStripeCheckout()
        }

        if(this.plaidService) {
            this.plaidService.closePlaidHandler()
        }
    }

    onPaymentMethodAddedWrapper = () => {
        const { onPaymentMethodAdded } = this.props

        if(onPaymentMethodAdded) {
            onPaymentMethodAdded()
        }
    }

    handleError = (err) => {
        this.setState({ errorMsg: getErrorMessageForStandardResponse(err)})
    }

    initializeStripeService = () => {
        const {
            authority: { authorityId, contactEmail, userType },
            paymentEnvironment
        } = this.props

        if(!this.stripeService) {
            this.stripeService = new StripeService(
                paymentEnvironment,
                { id: authorityId, userType, email: contactEmail},
                this.onPaymentMethodAddedWrapper,
                this.handleError
            )
        }
    }

    initializePlaidService = () => {
        const {
            authority: { authorityId, userType },
            paymentEnvironment
        } = this.props

        if(!this.plaidService) {
            this.plaidService = new PlaidService(
                paymentEnvironment,
                { id: authorityId, userType},
                this.onPaymentMethodAddedWrapper,
                this.handleError
                )
        }
    }

    initializeDwollaService = () => {
        if(!this.dwollaService) {
            this.dwollaService = new DwollaService(this.props.paymentEnvironment)
        }
    }

    handleAddPaymentMethod = () => {
        const { paymentType, verificationType } = this.state

        if(paymentType === PaymentType.CARD) {
            if(this.stripeService) {
                this.stripeService.openStripeCheckout()
            }
        } else if(paymentType === PaymentType.ACH && verificationType === VerificationType.INSTANT) {
            if(this.plaidService) {
                this.plaidService.openPlaidHandler()
            }
        } else if(paymentType === PaymentType.ACH && verificationType === VerificationType.MICRO_DEPOSIT) {
            this.setState({showAddMicroDepositPaymentMethod: true})
        }
    }

    onMicroDepositCancel = () => {
        this.setState({
            showAddMicroDepositPaymentMethod: false
        })
    }

    render() {
        const {
            isOpen,
            closeModal,
            authority,
            paymentEnvironment,
            bypassDwolla,
            disablePaymentMethod
        } = this.props

        const {
            paymentType,
            verificationType
        } = this.state

        return (
            <SecurSpaceModal isOpen={isOpen} className="payment-method-action-modal">
                <div className="payment-method-action-modal-header">Add Payment Method</div>
                {
                    this.state.showAddMicroDepositPaymentMethod ?
                        <AddMicroDepositPaymentMethod
                            authority={authority}
                            paymentEnvironment={paymentEnvironment}
                            bypassDwolla={bypassDwolla}
                            onPaymentMethodAdded={this.onPaymentMethodAddedWrapper}
                            onCancel={this.onMicroDepositCancel}
                        />
                        :
                        <AddPaymentMethodSetup
                            paymentType={paymentType}
                            verificationType={verificationType}
                            closeModal={closeModal}
                            onPaymentTypeChange={(paymentType) => this.setState({paymentType})}
                            onVerificationTypeChange={(verificationType) => this.setState({verificationType})}
                            onConfirm={this.handleAddPaymentMethod}
                            disablePaymentMethod={disablePaymentMethod}
                        />
                }
            </SecurSpaceModal>
        )
    }

}
