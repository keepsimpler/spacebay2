import React, { Component } from 'react';
import '../css/views/existingFundingSource.css';

class ExistingFundingSource extends Component {


    showNewFundingSourceForm = event => {
        this.props.toggleShowNewFundingSourceDetails();
        event.preventDefault();
    };

    render() {
        return (
            <form className="ss-form ss-block ss-existing-financial-profile-form">
                <div className="form-content">
                    <div>
                        <img className="pull-right" alt="" src="/app-images/users/Bank@2x.png" />
                    </div>
                    <div>
                        {
                            this.props.account.existingFundingSourceBankName ?
                                <div>
                                    <div>
                                        <p>Bank Name:</p>
                                        <span>{this.props.account.existingFundingSourceBankName}</span>
                                    </div>
                                    <div>
                                        <p>Bank Account Type:</p>
                                        <span>{this.props.account.existingFundingSourceBankAccountType}</span>
                                    </div>
                                    <div>
                                        <p>Nick Name:</p>
                                        <span>{this.props.account.existingFundingSourceAccountNickname}</span>
                                    </div>

                                </div>
                                : ""
                        }
                    </div>
                </div>

                <div className="border-top ss-button-container text-center">
                    {
                        this.props.account.existingFundingSourceBankName ?
                            <button
                                type="button"
                                id="removeFundingSourceButton"
                                className="ss-button-danger ss-remove-account-btn"
                                onClick={this.props.openDeletePayoutAccountModal}>
                                Remove Bank Account
                    </button>
                            : ""
                    }
                    <button
                        type="button"
                        id="createNewFundingSourceButton"
                        className="ss-button-primary"
                        onClick={this.showNewFundingSourceForm
                        }>
                        {
                            this.props.account.existingFundingSourceBankName ? "Change Bank Account" : "Add Bank Account"
                        }
                    </button>
                </div>

            </form>
        )
    }
}

export default ExistingFundingSource;