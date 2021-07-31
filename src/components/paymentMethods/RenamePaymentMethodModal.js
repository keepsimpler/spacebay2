import React, { Component } from 'react'
import SecurSpaceModal from "../common/SecurSpaceModal";
import ThirdPartyPartnerDetailsField from "../thirdPartyManagement/ThirdPartyPartnerDetailsField";
import { requestRenamePaymentMethod } from "./request/payment-method-requests";
import Busy from "../Busy";
import PropTypes from 'prop-types'

import 'css/payment-method-action-modal.css'
import 'css/rename-payment-method-modal.css'

export default class RenamePaymentMethodModal extends Component {
    static propTypes = {
        isOpen: PropTypes.bool.isRequired,
        paymentMethod: PropTypes.shape({
            id: PropTypes.string.isRequired,
            nickName: PropTypes.string
        }),
        authorityId: PropTypes.string.isRequired,
        userType: PropTypes.string.isRequired,
        closeModal: PropTypes.func.isRequired,
        onPaymentMethodModified: PropTypes.func.isRequired,
        nickName: PropTypes.string
    }

    constructor(props) {
        super(props);

        this.state = {
            errorMsg: null,
            nameUpdated: false,
            nickName: props.nickName || ""
        }
    }

    setNickName = (event) => {
        this.setState({
            nickName: event.target.value
        })
    }

    renamePaymentMethod = () => {
        const {
            paymentMethod: { id },
            authorityId,
            userType
        } = this.props

        Busy.set(true)

        requestRenamePaymentMethod(
            { authorityId, paymentMethodId: id, nickName: this.state.nickName },
            userType,
            () => {
                Busy.set(false)
                this.setState({nameUpdated: true})
            },
            () => {
                Busy.set(false)
                this.setState({errorMsg: "Failed to update nick name"})
            }
        )
    }

    onPaymentMethodNickNameUpdateConfirmation = () => {
        const { closeModal, onPaymentMethodModified } = this.props
        closeModal()
        onPaymentMethodModified()
    }

    render() {
        const {
            isOpen,
            closeModal
        } = this.props

        return (
            <SecurSpaceModal isOpen={isOpen} className="payment-method-action-modal">
                {
                    this.state.nameUpdated ?
                        <RenamePaymentMethodConfirmation
                            onClose={this.onPaymentMethodNickNameUpdateConfirmation}
                        />
                        :
                        <RenamePaymentMethodPrompt
                            nickName={this.state.nickName}
                            onChange={this.setNickName}
                            onClose={closeModal}
                            onConfirm={this.renamePaymentMethod}
                            errorMessage={this.state.errorMsg}
                        />

                }
            </SecurSpaceModal>
        )
    }
}

const RenamePaymentMethodPrompt = ({nickName, onChange, onClose, onConfirm, errorMessage}) => (
    <div>
        <div className="payment-method-action-modal-header">Rename Payment Method</div>
        <div className="payment-method-action-modal-prompt">
            <h4 className="rename-payment-method-prompt-text">Enter New Nick Name For Payment Method</h4>
            <ThirdPartyPartnerDetailsField
                name="nickName"
                label="NICK NAME"
                value={nickName}
                onChange={onChange}
            />
        </div>
        <div className="payment-method-action-modal-prompt-footer">
            { errorMessage && <div className="ss-error rename-payment-method-error">{errorMessage}</div> }
            <div className="payment-method-action-modal-prompt-btn-container">
                <div className="ss-button-secondary payment-method-action-modal-prompt-btn" onClick={onClose}>Cancel</div>
                <div className="ss-button-primary payment-method-action-modal-prompt-btn payment-method-action-modal-btn-confirm"
                     onClick={onConfirm}>
                    Rename Payment Method
                </div>
            </div>
        </div>
    </div>
)

const RenamePaymentMethodConfirmation = ({onClose}) => (
    <div>
        <div className="payment-method-action-modal-header">Rename Payment Method</div>
        <div className="payment-method-action-modal-prompt">
            <h3>PAYMENT METHOD RENAMED SUCCESSFULLY</h3>
        </div>
        <div className="payment-method-action-modal-prompt-footer">
            <div className="payment-method-action-modal-prompt-btn-container">
                <div className="ss-button-primary payment-method-action-modal-prompt-btn payment-method-action-modal-btn-confirm"
                     onClick={onClose}>
                    Done
                </div>
            </div>
        </div>
    </div>
)
