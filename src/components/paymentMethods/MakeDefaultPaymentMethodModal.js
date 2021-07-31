import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SecurSpaceModal from "../common/SecurSpaceModal";
import Busy from "../Busy";

import { requestMakePaymentMethodDefault } from "./request/payment-method-requests";
import { getErrorMessageForStandardResponse } from "../../util/NetworkErrorUtil";

import 'css/make-default-payment-method-modal.css'

export default class MakeDefaultPaymentMethodModal extends Component {

    static propTypes = {
        isOpen: PropTypes.bool.isRequired,
        paymentMethod: PropTypes.shape({
            id: PropTypes.string.isRequired,
            lastFour: PropTypes.string.isRequired
        }),
        closeModal: PropTypes.func.isRequired,
        onMadeDefault: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            errorMsg: null,
            madeDefault: false
        }
    }

    makePaymentMethodDefault = () => {
        const {
            paymentMethod: { id }
        } = this.props

        Busy.set(true)

        requestMakePaymentMethodDefault(id)
            .then(() => {
                Busy.set(false)
                this.setState({madeDefault: true})
            })
            .catch((err) => {
                Busy.set(false)
                this.setState({errorMsg: getErrorMessageForStandardResponse(err)})
            })
    }

    onConfirmationExit = () => {
        this.props.closeModal()
        this.props.onMadeDefault()
    }

    render() {

        const {
            isOpen,
            paymentMethod: { lastFour },
            closeModal
        } = this.props

        return (
            <SecurSpaceModal isOpen={isOpen} className="make-default-payment-modal">
                {
                    this.state.madeDefault ?
                        <MakePaymentMethodDefaultConfirmation onClose={this.onConfirmationExit} />
                        :
                        <MakePaymentMethodDefaultPrompt
                            lastFour={lastFour}
                            onClose={closeModal}
                            error={this.state.errorMsg}
                            onConfirm={this.makePaymentMethodDefault}
                        />

                }
            </SecurSpaceModal>
        )
    }
}

const MakePaymentMethodDefaultPrompt = ({ lastFour, onClose, onConfirm, error }) => (
    <div>
        <div className="make-default-payment-modal-header">Make Default Payment Method</div>
        <div className="make-default-payment-modal-prompt">
            Are you sure you want to make payment method ending in { lastFour } your default payment method?
        </div>
        <div className="make-default-payment-modal-footer">
            {
                error && <div className="ss-error">{error}</div>
            }
            <div className="make-default-payment-modal-btn-container">
                <div onClick={onClose} className="ss-button-secondary make-default-payment-btn">Cancel</div>
                <div onClick={onConfirm} className="ss-button-primary make-default-payment-btn make-default-payment-btn-confirm">Confirm</div>
            </div>
        </div>
    </div>
)

const MakePaymentMethodDefaultConfirmation = ({ onClose }) => (
    <div>
        <div className="make-default-payment-modal-header">Make Default Payment Method</div>
        <div className="make-default-payment-confirmation-prompt">
            <h4>Payment method successfully added as default</h4>
        </div>
        <div className="make-default-payment-confirmation-btn-container">
            <div onClick={onClose} className="ss-button-primary make-default-payment-btn make-default-payment-btn-confirm">Done</div>
        </div>
    </div>
)
