import React, { Component } from 'react'
import ModalCurrencyField from "../fields/ModalCurrencyField";
import PropTypes from 'prop-types'

export default class VerifyPaymentMethodPrompt extends Component {

    static propTypes = {
        onChange: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
        onConfirm: PropTypes.func.isRequired,
        error: PropTypes.string,
        depositAmounts: PropTypes.shape({
            deposit1: PropTypes.oneOfType([
                PropTypes.string.isRequired,
                PropTypes.number.isRequired
            ]),
            deposit2: PropTypes.oneOfType([
                PropTypes.string.isRequired,
                PropTypes.number.isRequired
            ])
        })
    }

    render() {

        const {
            onCancel,
            onChange,
            onConfirm,
            error,
            depositAmounts: { deposit1, deposit2 }
        } = this.props

        return (
            <div>
                <div className="payment-method-action-modal-header">
                    Verify Bank Account
                </div>
                <div className="payment-method-action-modal-prompt">
                    <div>
                        <h4 className="ss-summary">Enter Bank Account Deposit Amounts</h4>
                        <ul className="verify-payment-method-details-list">
                            <li><p>Two deposits were made into your bank account</p></li>
                            <li><p>Deposit amounts are less than $1.00</p></li>
                            <li><p>Deposits take 1-2 days to appear</p></li>
                        </ul>

                        <ModalCurrencyField
                            name="deposit1"
                            label="FIRST DEPOSIT AMOUNT"
                            value={deposit1}
                            onChange={(value) => onChange({deposit1: value})}
                            maxLength={10}
                            placeholder="Enter first micro deposit amount"
                            className="deposit-one-field"
                        />

                        <ModalCurrencyField
                            name="deposit2"
                            label="SECOND DEPOSIT AMOUNT"
                            value={deposit2}
                            onChange={(value) => onChange({deposit2: value})}
                            maxLength={10}
                            placeholder="Enter first micro deposit amount"
                        />

                    </div>
                </div>
                <div className="payment-method-action-modal-prompt-footer">
                    {
                        error && <div className="ss-error payment-method-action-modal-error">{error}</div>
                    }
                    <div className="payment-method-action-modal-prompt-btn-container">
                        <div className="ss-button-secondary payment-method-action-modal-prompt-btn" onClick={onCancel}>Cancel</div>
                        <div
                            className="ss-button-primary payment-method-action-modal-btn-confirm payment-method-action-modal-prompt-btn"
                            onClick={onConfirm}
                        >
                            Verify Bank Account
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
