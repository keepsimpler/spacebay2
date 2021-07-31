import React, { Component } from 'react'
import ReportRowAction from "../../ReportRowAction";
import DeletePaymentMethodModal from "../DeletePaymentMethodModal";
import RenamePaymentMethodModal from "../RenamePaymentMethodModal";
import MakeDefaultPaymentMethodModal from "../MakeDefaultPaymentMethodModal";
import VerifyPaymentMethodModal from "../verifyPaymentMethod/VerifyPaymentMethodModal";
import PropTypes from 'prop-types'

import 'css/payment-method-card.css'

export default class PaymentMethodCard extends Component {

    static propTypes = {
        authorityId: PropTypes.string.isRequired,
        userType: PropTypes.string.isRequired,
        paymentMethod: PropTypes.shape({
            id: PropTypes.string.isRequired,
            bankName: PropTypes.string,
            cardBrand: PropTypes.string,
            lastFour: PropTypes.string,
            nickName: PropTypes.string,
            expiresOn: PropTypes.string,
            defaultPaymentMethodForProfile: PropTypes.bool
        }),
        onPaymentMethodModified: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);

        this.state = {
            deletePaymentMethodModalOpen: false,
            renamePaymentMethodModalOpen: false,
            makeDefaultPaymentMethodModalOpen: false,
            verifyPaymentMethodModalOpen: false
        }
    }

    needsVerification = () => {
        const { paymentMethod } = this.props

        const stripeVerified = paymentMethod.stripeCustomerId && paymentMethod.stripeStatus && paymentMethod.stripeStatus !== 'verified'
        const dwollaVerified = paymentMethod.dwollaFundingSourceId && paymentMethod.dwollaStatus && paymentMethod.dwollaStatus !== 'verified'

        return stripeVerified || dwollaVerified
    }

    setDeletePaymentMethodModalVisibility = (isOpen : boolean) => {
        this.setState({deletePaymentMethodModalOpen: isOpen})
    }

    setRenamePaymentMethodModalVisibility = (isOpen : boolean) => {
        this.setState({renamePaymentMethodModalOpen: isOpen})
    }

    setMakeDefaultPaymentMethodModalVisibility = (isOpen: boolean) => {
        this.setState({makeDefaultPaymentMethodModalOpen: isOpen})
    }

    setVerifyPaymentMethodModalOpen = (isOpen: boolean) => {
        this.setState({
            verifyPaymentMethodModalOpen: isOpen
        })
    }

    render() {
        const { authorityId, userType, paymentMethod, onPaymentMethodModified } = this.props
        const {
            bankName,
            cardBrand,
            lastFour,
            nickName,
            expiresOn,
            defaultPaymentMethodForProfile
        } = paymentMethod

        const paymentMethodActionItems = [
            {
                displayValue: "Remove",
                action: () => this.setDeletePaymentMethodModalVisibility(true)
            },
            {
                displayValue: "Rename",
                action: () => this.setRenamePaymentMethodModalVisibility(true)
            }
        ]

        if(!defaultPaymentMethodForProfile) {
            paymentMethodActionItems.push({
                displayValue: "Make default",
                action: () => this.setMakeDefaultPaymentMethodModalVisibility(true)
            })
        }

        return (
            <div className="payment-method-card">
                <PaymentDetail label="TYPE" value={bankName ? "Bank Account" : "Card"} />
                <PaymentDetail label={bankName ? "BANK NAME" : "BRAND"} value={bankName || cardBrand} />
                <PaymentDetail label="LAST 4" value={lastFour} />
                <PaymentDetail label="NICK NAME" value={nickName} />
                {
                    expiresOn &&
                    <PaymentDetail label="EXPIRES" value={expiresOn} />
                }

                {
                    defaultPaymentMethodForProfile &&
                        <PaymentDetail label="DEFAULT" value="YES" />
                }

                {
                    this.needsVerification() &&
                        <div className="payment-method-verification">
                            <div onClick={() => this.setVerifyPaymentMethodModalOpen(true)} className="ss-button-primary cursor-pointer payment-method-verify-btn">
                                Verify
                            </div>
                        </div>
                }

                <div className="payment-method-options">
                    <ReportRowAction item={paymentMethod} actions={paymentMethodActionItems} />
                </div>

                {
                    this.state.deletePaymentMethodModalOpen &&
                        <DeletePaymentMethodModal
                            authorityId={authorityId}
                            userType={userType}
                            isOpen={true}
                            paymentMethod={paymentMethod}
                            closeModal={() => this.setDeletePaymentMethodModalVisibility(false)}
                            onPaymentMethodRemoved={onPaymentMethodModified}
                        />
                }

                {
                    this.state.renamePaymentMethodModalOpen &&
                        <RenamePaymentMethodModal
                            authorityId={authorityId}
                            userType={userType}
                            isOpen={true}
                            paymentMethod={paymentMethod}
                            closeModal={() => this.setRenamePaymentMethodModalVisibility(false)}
                            onPaymentMethodModified={onPaymentMethodModified}
                            nickName={nickName}
                        />
                }

                {
                    this.state.makeDefaultPaymentMethodModalOpen &&
                        <MakeDefaultPaymentMethodModal
                            isOpen={true}
                            closeModal={() => this.setMakeDefaultPaymentMethodModalVisibility(false)}
                            paymentMethod={paymentMethod}
                            onMadeDefault={onPaymentMethodModified}
                            />

                }

                {
                    this.state.verifyPaymentMethodModalOpen &&
                        <VerifyPaymentMethodModal
                            isOpen={true}
                            paymentMethodId={paymentMethod.id}
                            closeModal={() => this.setVerifyPaymentMethodModalOpen(false)}
                            onVerificationComplete={onPaymentMethodModified} />
                }

            </div>
        )
    }
}


const PaymentDetail = ({label, value}) => (
    <div className="payment-method-detail">
        <div className="payment-method-detail-label">
            {label}:
        </div>
        <div className="payment-method-detail-value">
            {value}
        </div>
    </div>
)
