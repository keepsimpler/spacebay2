import React, { Component } from 'react';
import '../css/views/bankAccountInfo.css';
import ExistingFundingSource from "./ExistingFundingSource";
import NewFundingSource from "./NewFundingSource";
import DeletePayoutAccountModal from "../components/paymentMethods/DeletePayoutAccoutModal";

class BankAccountInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showNewFundingSourceDetails: false,
            deletePayoutAccountModalOpen: false,
        };
    }

    toggleShowNewFundingSourceDetails = () => {
        this.setState({ showNewFundingSourceDetails: !this.state.showNewFundingSourceDetails });
    };

    openDeletePayoutAccountModal = () => {
        this.setState({ deletePayoutAccountModalOpen: true });
    }

    closeDeletePayoutAccountModal = () => {
        this.setState({ deletePayoutAccountModalOpen: false });
    }
    
    render() {
        return (
            <div className="container-company-bank">
                {
                    this.state.deletePayoutAccountModalOpen &&
                    <DeletePayoutAccountModal
                        account={this.props.account}
                        isOpen={this.state.deletePayoutAccountModalOpen}
                        closeModal={this.closeDeletePayoutAccountModal}
                        handleAccountUpdated={this.props.handleAccountUpdated}
                    />
                }
                {
                    this.state.showNewFundingSourceDetails ?
                        <NewFundingSource
                            toggleShowNewFundingSourceDetails={this.toggleShowNewFundingSourceDetails}
                            account={this.props.account}
                            handleLogout={this.props.handleLogout}
                            handleAccountUpdated={this.props.handleAccountUpdated}
                        />

                        :
                        <ExistingFundingSource account={this.props.account}  openDeletePayoutAccountModal={this.openDeletePayoutAccountModal}
                             toggleShowNewFundingSourceDetails={this.toggleShowNewFundingSourceDetails} />
                }
            </div>
        );
    }
}

export default BankAccountInfo;