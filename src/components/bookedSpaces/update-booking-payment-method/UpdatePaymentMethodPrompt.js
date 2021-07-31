import React, { Component } from 'react'
import { Link } from "react-router-dom";
import { PaymentType } from "../../constants/securspace-constants";
import PropTypes from 'prop-types'

import _ from 'underscore'

import 'css/payment-method-action-modal.css'
import 'css/update-payment-method-prompt.css'

export default class UpdatePaymentMethodPrompt extends Component {

    static propTypes = {
        onCancel: PropTypes.func.isRequired,
        onConfirm: PropTypes.func.isRequired,
        paymentMethods: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.string.isRequired,
            bankName: PropTypes.string,
            cardBrand: PropTypes.string,
            type: PropTypes.string.isRequired,
            lastFour: PropTypes.string.isRequired
        })),
        reservationAgreementUrl: PropTypes.string.isRequired,
        returnTo: PropTypes.string,
        errorMsg: PropTypes.string
    }

    constructor(props) {
        super(props);

        this.state = {
            selectedPaymentMethodId: null,
            selectedPaymentMethodType: null,
            agreementAccepted: false
        }
    }

    handlePaymentMethodChange = (id, type) => {
        this.setState({
            selectedPaymentMethodId: id,
            selectedPaymentMethodType: type
        })
    }

    generateAddPaymentMethodLink = () => {
        const { returnTo } = this.props

        return <Link className="add-payment-method-link fw-400" to={{
            pathname: '/company-profile',
            search: `?managePaymentMethods=true${returnTo ? `&returnTo=${returnTo}` : ""}`
        }}>Add Payment Method</Link>
    }

    handleAgreementAcceptedChange = (evt) => {
        this.setState({
            agreementAccepted: evt.target.checked
        })
    }

    generatePaymentMethodOptions = () => {
        return _.map(this.props.paymentMethods, (method, idx) => {
            return <PaymentMethodOption
                id={method.id}
                key={idx}
                lastFour={method.lastFour}
                type={method.type}
                displayName={method.type === PaymentType.CARD ? method.cardBrand : method.bankName}
                onChange={this.handlePaymentMethodChange}
                checked={this.state.selectedPaymentMethodId === method.id} />
        })
    }

    handleConfirm = () => {
        const {
            agreementAccepted,
            selectedPaymentMethodId
        } = this.state

        let error

        if(!selectedPaymentMethodId) {
            error = "You must select a payment method"
        } else if(!agreementAccepted) {
            error = "You must accept the service agreement"
        }

        if(error) {
            this.setState({
                error
            })
            return
        }

        this.setState({error: null})

        const { onConfirm } = this.props
        onConfirm(selectedPaymentMethodId)
    }

    render() {

        const {
            onCancel,
            reservationAgreementUrl,
            errorMsg: topLevelError
        } = this.props

        const {
            error
        } = this.state

        return (
            <div>
                <div className="payment-method-action-modal-header">
                    Update Payment Method
                </div>
                <div className="payment-method-action-modal-prompt">
                    <h4>Select Payment Method</h4>

                    {
                        this.generatePaymentMethodOptions()
                    }

                    {
                        this.generateAddPaymentMethodLink()
                    }

                    {
                        this.state.selectedPaymentMethodType === PaymentType.CARD &&
                            <div className="help-block fw-400 update-payment-method-payment-fee-warning">
                                <span className="glyphicon glyphicon-info-sign" aria-hidden="true"/>
                                    Additional credit card processing fee applies
                            </div>
                    }

                    <hr/>

                    <div>
                        <h4>Accept Terms Of Service Agreement:</h4>
                        <div className="update-payment-method-tos-container fw-400">
                            <div>
                                <input type="checkbox"
                                       className="update-payment-method-tos-checkbox"
                                       id="agreementAccepted"
                                       name="agreementAccepted"
                                       value={this.state.agreementAccepted}
                                       onChange={this.handleAgreementAcceptedChange}
                                       title="Please read and accept the agreement to book space"
                                />
                            </div>
                            <span className="update-payment-method-tos-text">I accept the
                                <a href={reservationAgreementUrl} target="_blank" rel="noopener noreferrer"> rental agreement</a>
                            </span>
                        </div>
                    </div>
                </div>
                <div className="payment-method-action-modal-prompt-footer">
                    {
                        error && <div className="ss-error payment-method-action-modal-error">{error}</div>
                    }
                    {
                        topLevelError && <div className="ss-error payment-method-action-modal-error">{topLevelError}</div>
                    }
                    <div className="payment-method-action-modal-prompt-btn-container">
                        <div className="ss-button-secondary payment-method-action-modal-prompt-btn" onClick={onCancel}>Cancel</div>
                        <div className="ss-button-primary payment-method-action-modal-btn-confirm payment-method-action-modal-prompt-btn"
                             onClick={this.handleConfirm}
                        >
                            Next
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const PaymentMethodOption = ({checked, id, type, lastFour, displayName, onChange}) => (
    <div className="update-payment-method-selector">
        <input type="radio"
               className="update-payment-method-input"
               id={id}
               name="paymentMethodOption"
               checked={checked}
               onChange={() => onChange(id, type)}
        />

        <div className="update-payment-method-radio-button-label">
            <span className="update-payment-method-label-bold">{displayName}</span>
            <span className="fw-400"> ending in </span>
            <span className="update-payment-method-label-bold">{lastFour}</span>
        </div>
    </div>
)
