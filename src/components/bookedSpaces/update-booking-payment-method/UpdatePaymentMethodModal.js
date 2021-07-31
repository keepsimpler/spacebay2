import React, {Component} from 'react'
import SecurSpaceModal from "../../common/SecurSpaceModal";
import PropTypes from 'prop-types'
import UpdatePaymentMethodPrompt from "./UpdatePaymentMethodPrompt";
import UpdateBookingPaymentMethodSuccess from "./UpdateBookingPaymentMethodSuccess";
import {requestPaymentMethods} from "../../paymentMethods/request/payment-method-requests";
import {requestCompleteBooking} from "../request/booked-spaces-requests";
import {AuthorityType} from "../../constants/securspace-constants";
import {getErrorMessageForStandardResponse} from "../../../util/NetworkErrorUtil";
import Busy from "../../Busy";
import 'css/payment-method-action-modal.css'

export default class UpdatePaymentMethodModal extends Component {

    static propTypes = {
        isOpen: PropTypes.bool.isRequired,
        booking: PropTypes.shape({
            id: PropTypes.string.isRequired,
            supplierLegalAgreementFileName: PropTypes.string
        }),
        authorityId: PropTypes.string.isRequired,
        authorityType: PropTypes.string,
        returnTo: PropTypes.string,
        onClose: PropTypes.func.isRequired,
        onSuccess: PropTypes.func
    }

    constructor(props) {
        super(props);

        const { authorityId, authorityType } = props

        this.state = {
            paymentMethodUpdated: false,
            paymentMethods: []
        }

        Busy.set(true)

        requestPaymentMethods(
            authorityId,
            authorityType ? authorityType : AuthorityType.ACCOUNT,
            this.handleRequestPaymentMethodSuccess,
            this.handleRequestPaymentMethodsFailure
        )

    }

    handleRequestPaymentMethodSuccess = (paymentMethods) => {
        Busy.set(false)
        this.setState({paymentMethods: paymentMethods})
    }

    handleRequestPaymentMethodsFailure = (err) => {
        Busy.set(false)
        this.setState({errorMsg: getErrorMessageForStandardResponse(err)})
    }

    handleUpdatePaymentMethod = (paymentMethodId: String) => {
        const {
            booking: {id},
            authorityId
        } = this.props

        const completeBookingData = {
            id: id,
            buyerAccountId: authorityId,
            tosDocUrl: this.getReservationAgreementUrl(),
            paymentMethodId
        }

        Busy.set(true)

        requestCompleteBooking(completeBookingData)
            .then((resp) => {
                Busy.set(false)
                this.setState({paymentMethodUpdated: true})
            })
            .catch((err) => {
                Busy.set(false)
                this.setState({errorMsg: getErrorMessageForStandardResponse(err)})
            })
    }

    getReservationAgreementUrl = () => {
        const { booking } = this.props
        const { supplierLegalAgreementFileName } = booking || {}

        if(supplierLegalAgreementFileName) {
            return `https://s3-us-west-1.amazonaws.com/securspace-files/legal-agreements/${supplierLegalAgreementFileName}`
        } else {
            return "https://s3-us-west-1.amazonaws.com/securspace-files/app-files/RESERVATION+AGREEMENT.pdf"
        }
    }

    onSuccessfulClose = () => {
        const { onClose, onSuccess } = this.props

        if(onSuccess) {
            onSuccess()
        }

        onClose()
    }

    render() {
        const {
            isOpen,
            booking: { id },
            onClose,
            returnTo
        } = this.props

        const {
            failedTransactions,
            paymentMethodUpdated,
            errorMsg,
            paymentMethods
        } = this.state

        return (
            <SecurSpaceModal isOpen={isOpen} className="payment-method-action-modal">
                {
                    paymentMethodUpdated ?
                        <UpdateBookingPaymentMethodSuccess
                            bookingId={id}
                            failedTransactions={failedTransactions}
                            onClose={this.onSuccessfulClose}
                        />
                        :
                        <UpdatePaymentMethodPrompt
                            onCancel={onClose}
                            onConfirm={this.handleUpdatePaymentMethod}
                            paymentMethods={paymentMethods}
                            reservationAgreementUrl={this.getReservationAgreementUrl()}
                            returnTo={returnTo}
                            errorMsg={errorMsg}
                        />
                }
            </SecurSpaceModal>
        )
    }
}
