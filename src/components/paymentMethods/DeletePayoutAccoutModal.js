import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Busy from "../Busy";
import SecurSpaceModal from "../common/SecurSpaceModal";
import { removeAccountFundingSource } from "../user/request/user-requests";


export default class DeletePayoutAccountModal extends Component {
    static propTypes = {
        isOpen: PropTypes.bool.isRequired,
        closeModal: PropTypes.func.isRequired,
        account: PropTypes.object.isRequired,
        handleAccountUpdated: PropTypes.func.isRequired
    }
    constructor(props) {
        super(props);

        this.state = {
            errorMsg: null,
            payoutAccountRemoved: false
        }
    }
     

    removeFundingSource = () => {
        Busy.set(true);
        this.setState({ errorMsg: '' });
        removeAccountFundingSource(this.props.account.id,
            (response) => {
                this.props.handleAccountUpdated(response)
                Busy.set(false);
                this.setState({ payoutAccountRemoved: true });
            },
            (error) => {
                Busy.set(false);
                this.setState({
                    errorMsg: error ? error.message : "Internal Server Error"
                });
            });
    }

    render() {
        const {
            isOpen,
            closeModal
        } = this.props

        return (
            <SecurSpaceModal isOpen={isOpen} className="delete-payment-method-modal">
                {
                    this.state.payoutAccountRemoved ?
                        <DeletePayoutAccountModalConfirmation onClose={closeModal} />
                        :
                        <DeletePayoutAccountPrompt onClose={closeModal} onConfirm={this.removeFundingSource} error={this.state.errorMsg} />
                }
            </SecurSpaceModal>
        )
    }

}

const DeletePayoutAccountPrompt = ({ onClose, onConfirm, error }) => (
    <div>
        <div className="delete-payment-method-header">Remove Payout Account</div>
        <div className="delete-payment-prompt">
            Are you sure you would like to remove this payout account?
            Please make sure to replace or update your bank account on file in order to process any payouts from SecurSpace going forward.
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


const DeletePayoutAccountModalConfirmation = ({ onClose }) => (
    <div>
        <div className="delete-payment-method-header">Remove Payout Account</div>
        <div className="delete-payment-confirmation-prompt">
            <h4>Payout Accout removed successfully</h4>
        </div>
        <div className="delete-payment-confirmation-btn-container">
            <div className="ss-button-primary delete-payment-prompt-btn delete-payment-btn-confirm" onClick={onClose}>Done</div>
        </div>
    </div>
)
