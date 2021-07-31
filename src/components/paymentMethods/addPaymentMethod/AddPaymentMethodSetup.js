import React, { Component } from 'react'
import {PaymentType} from "../../constants/securspace-constants";
import classNames from "classnames";
import PayWithACH from "./PayWithACH";
import PropTypes from 'prop-types'

export default class AddPaymentMethodSetup extends Component {

    static propTypes = {
        paymentType: PropTypes.string.isRequired,
        verificationType: PropTypes.string.isRequired,
        closeModal: PropTypes.func.isRequired,
        onPaymentTypeChange: PropTypes.func.isRequired,
        onVerificationTypeChange: PropTypes.func.isRequired,
        onConfirm: PropTypes.func.isRequired,
        disablePaymentMethod: PropTypes.string
    }

    render() {
        const {
            closeModal,
            paymentType,
            verificationType,
            onPaymentTypeChange,
            onVerificationTypeChange,
            onConfirm,
            disablePaymentMethod
        } = this.props

        return (
            <div className="add-payment-method-modal-content">
                <div className="add-payment-method-selection-info">
                    <h4 className="add-payment-method-select-type-header">Select Payment Method</h4>
                    <div className="add-payment-method-pill-group">

                        {
                            disablePaymentMethod !== PaymentType.CARD &&
                            <div
                                onClick={() => onPaymentTypeChange(PaymentType.CARD)}
                                className={classNames("add-payment-method-pill", { "active": paymentType === PaymentType.CARD })}>
                                Pay with card
                            </div>
                        }

                        {
                            disablePaymentMethod !== PaymentType.ACH &&
                            <div
                                onClick={() => onPaymentTypeChange(PaymentType.ACH)}
                                className={classNames("add-payment-method-pill", { "active": paymentType === PaymentType.ACH })}
                            >
                                Pay with ACH
                            </div>
                        }


                    </div>
                    {
                        paymentType === PaymentType.CARD ?
                            <div className="add-payment-method-cc-info">
                                <span className="glyphicon glyphicon-info-sign"/>
                                Additional credit card processing fee applies
                            </div>

                            :

                            <PayWithACH
                                containerClassName="pay-with-ach-container"
                                verificationType={verificationType}
                                onChange={onVerificationTypeChange}
                            />
                    }

                </div>
                <div className="on-demand-agreement">
                    <div className="ss-summary add-payment-method-authorization-header">Authorization Agreement</div>
                    <div className="ss-details">
                        I agree that all future payments to or facilitated by SecūrSpace will be processed by
                        the Dwolla or Stripe payment systems from the account I select for this payment method. In order
                        to cancel this authorization, I will change my payment settings within my SecūrSpace account.
                    </div>
                </div>
                <div className="payment-method-action-modal-prompt-footer">
                    <div className="payment-method-action-modal-prompt-btn-container">
                        <div onClick={closeModal} className="ss-button-secondary payment-method-action-modal-prompt-btn">Cancel</div>
                        <div onClick={onConfirm} className="ss-button-primary payment-method-action-modal-prompt-btn payment-method-action-modal-btn-confirm">Agree & Continue</div>
                    </div>
                </div>
            </div>
        )
    }
}
