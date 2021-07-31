import React, {Component} from 'react'
import SecurSpaceModal from "../../common/SecurSpaceModal";
import {requestVerifyBankAccount} from "../request/payment-method-requests";
import {getErrorMessageForStandardResponse} from "../../../util/NetworkErrorUtil";
import VerifyPaymentMethodPrompt from "./VerifyPaymentMethodPrompt";
import Busy from "../../Busy";
import PropTypes from 'prop-types'

import 'css/verify-payment-method-modal.css'
import 'css/payment-method-action-modal.css'

export default class VerifyPaymentMethodModal extends Component {

    static propTypes = {
        isOpen: PropTypes.bool.isRequired,
        paymentMethodId: PropTypes.string.isRequired,
        closeModal: PropTypes.func.isRequired,
        onVerificationComplete: PropTypes.func
    }

    constructor(props) {
        super(props);

        this.state = {
            verifySuccess: false,
            depositAmounts: {
                deposit1: "",
                deposit2: ""
            },
            errorMsg: null
        }
    }

    handleDepositAmountChange = (depositAmounts) => {
        this.setState({
            depositAmounts: {...this.state.depositAmounts, ...depositAmounts}
        })
    }

    handleVerifyRequest = () => {
        const { paymentMethodId } = this.props

        const { depositAmounts: { deposit1, deposit2} } = this.state

        Busy.set(true)

        requestVerifyBankAccount({
            paymentMethodId,
            microDeposit1: deposit1,
            microDeposit2: deposit2
        })
            .then(() => {
                Busy.set(false)
                this.setState({verifySuccess: true})
            })
            .catch((err) => {
                Busy.set(false)
                this.setState({
                    errorMsg: getErrorMessageForStandardResponse(err, "An error occurred while verifying this payment method.")
                })
            })
    }

    onFinished = () => {
        const { closeModal, onVerificationComplete } = this.props

        closeModal()
        if(onVerificationComplete) {
            onVerificationComplete()
        }
    }


    render() {

        const {
            isOpen,
            closeModal
        } = this.props

        return (
            <SecurSpaceModal isOpen={isOpen} className="payment-method-action-modal">

                {
                    this.state.verifySuccess ?
                        <VerifyPaymentMethodSuccess
                            onConfirm={this.onFinished}
                        />
                        :
                        <VerifyPaymentMethodPrompt
                            onCancel={closeModal}
                            onChange={this.handleDepositAmountChange}
                            error={this.state.errorMsg}
                            onConfirm={this.handleVerifyRequest}
                            depositAmounts={this.state.depositAmounts}
                        />

                }

            </SecurSpaceModal>
        )
    }

}


const VerifyPaymentMethodSuccess = ({ onConfirm }) => (
    <div>
        <div className="payment-method-action-modal-header">
            Verify Bank Account
        </div>
        <div className="payment-method-action-modal-prompt">
            <h3 className="verification-successful-header">BANK ACCOUNT VERIFIED SUCCESSFULLY</h3>
            <div className="verification-successful-details">
                <p>This payment method is now fully verified</p>
                <p>You may now use this payment method to pay for Bookings</p>
            </div>
        </div>
        <div className="payment-method-action-modal-prompt-footer">
            <div className="payment-method-action-modal-prompt-btn-container">
                <div
                    className="ss-button-primary payment-method-action-modal-btn-confirm payment-method-action-modal-prompt-btn"
                    onClick={onConfirm}
                >
                    Done
                </div>
            </div>
        </div>
    </div>
)
