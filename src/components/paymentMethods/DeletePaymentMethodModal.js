import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SecurSpaceModal from "../common/SecurSpaceModal";
import Busy from "../Busy";

import { requestDeactivatePaymentMethod } from "./request/payment-method-requests";

import 'css/delete-payment-method-modal.css'

export default class DeletePaymentMethodModal extends Component {
    static propTypes = {
        isOpen: PropTypes.bool.isRequired,
        paymentMethod: PropTypes.shape({
            id: PropTypes.string.isRequired,
            lastFour: PropTypes.string.isRequired
        }),
        authorityId: PropTypes.string.isRequired,
        userType: PropTypes.string.isRequired,
        closeModal: PropTypes.func.isRequired,
        onPaymentMethodRemoved: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);

        this.state = {
            errorMsg: null,
            paymentRemoved: false
        }
    }

    deletePaymentMethod = () => {
        const {
            paymentMethod: { id },
            authorityId,
            userType
        } = this.props

        Busy.set(true)

        requestDeactivatePaymentMethod(
            authorityId,
            id,
            userType,
            () => {
                Busy.set(false)
                this.setState({paymentRemoved: true})
            },
            () => {
                Busy.set(false)
                this.setState({errorMsg: "Failed to remove payment method"})
            }
        )
    }

    onPaymentRemovedConfirmation = () => {
        const { closeModal, onPaymentMethodRemoved } = this.props
        closeModal()
        onPaymentMethodRemoved()
    }


    render() {
        const {
            isOpen,
            paymentMethod: { lastFour },
            closeModal
        } = this.props

        return (
            <SecurSpaceModal isOpen={isOpen} className="delete-payment-method-modal">
                {
                    this.state.paymentRemoved ?
                        <DeletePaymentMethodConfirmation onClose={this.onPaymentRemovedConfirmation} />
                        :
                        <DeletePaymentMethodPrompt onClose={closeModal} onConfirm={this.deletePaymentMethod} lastFour={lastFour} error={this.state.errorMsg} />
                }
            </SecurSpaceModal>
        )
    }
}

const DeletePaymentMethodPrompt = ({lastFour, onClose, onConfirm, error}) => (
    <div>
        <div className="delete-payment-method-header">Remove Payment Method</div>
        <div className="delete-payment-prompt">
            Are you sure you want to remove payment method ending in { lastFour }?
        </div>
        <div className="delete-payment-prompt-footer">
            {
                error && <div className="ss-error">{error}</div>
            }
            <div className="delete-payment-prompt-btn-container">
                <div className="ss-button-secondary delete-payment-prompt-btn" onClick={onClose}>Cancel</div>
                <div className="ss-button-primary delete-payment-prompt-btn delete-payment-btn-confirm" onClick={onConfirm}>Confirm</div>
            </div>
        </div>
    </div>
)

const DeletePaymentMethodConfirmation = ({onClose}) => (
    <div>
        <div className="delete-payment-method-header">Remove Payment Method</div>
        <div className="delete-payment-confirmation-prompt">
            <h4>Payment method removed successfully</h4>
        </div>
        <div className="delete-payment-confirmation-btn-container">
            <div className="ss-button-primary delete-payment-prompt-btn delete-payment-btn-confirm" onClick={onClose}>Done</div>
        </div>
    </div>
)
