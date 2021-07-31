import React, { Component } from "react";
import AccountReport from "./AccountReport";
import '../css/components/alert.css';
import ConfirmDeleteAccount from "../components/ConfirmDeleteAccount";
import { toast } from 'react-toastify';
import ConfirmDialog from "../components/ConfirmDialog";
import { GlobalModalContext } from "../context/global-modal-context";

const $ = window.$;

class AdminAccountsReport extends Component {
    static contextType = GlobalModalContext

    constructor(props) {
        super(props);
        this.state = {
            account: this.props.account,
            viewUser: null,
            activeSubview: null,
            reloadData: false,
            showChangeTypeConfirmation: false
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.account !== this.state.account) {
            this.setState({ account: nextProps.account });
        }
    }

    deleteAccountConfirm = item => {
        let message = 'YOU ARE ABOUT TO DELETE THIS ACCOUNT. \n THIS IS NOT REVERSIBLE!!!';
        let type = 'DELETE';
        this.setState({
            reloadData: false,
            activeSubview: <ConfirmDeleteAccount account={item}
                message={message}
                type={type}
                closeEventHandler={this.onClose}
                proceedEventHandler={this.deleteProceed}
            />
        })
    };

    changeAccountConfirm = item => {

        let message = item.activated ? 'YOU ARE ABOUT TO DEACTIVATE THIS ACCOUNT.' : 'YOU ARE ABOUT TO ACTIVATE THIS ACCOUNT.';
        let type = item.activated ? 'DEACTIVATE ACCOUNT' : 'ACTIVATE ACCOUNT';
        this.setState({
            reloadData: false,
            activeSubview: <ConfirmDeleteAccount account={item}
                message={message}
                type={type}
                closeEventHandler={this.onClose}
                proceedEventHandler={this.changeStatus}
            />
        })
    };

    changeTypeConfirm = item => {
        this.setState({
            reloadData: false,
            activeSubview: <ConfirmDialog showAlert="true"
                title={"Change type to " + (item.userType === 'Buyer' ? 'Partner' : 'Customer')}
                onClose={this.onClose}
                proceedEventHandler={() => this.changeType(item)}>
                Are you sure you want to change the account type?
            </ConfirmDialog>

        })
    };

    changeType = item => {
        $.ajax({
            url: `/api/account/switch-type/${item.id}`,
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            success: (data) => {
                this.onClose();
                toast.success("Success!"); //meeting request from 13.02.2019
            },
            error: (error) => {
                this.onClose();
                toast.error('Something goes wrong!'); //meeting request from 13.02.2019
            }
        });

    };

    changeStatus = account => {
        if (account) {
            $.ajax({
                url: `/api/account/set-enabled-account/${account.account.id}`,
                type: 'POST',
                contentType: 'application/json; charset=UTF-8',
                success: (data) => {
                    this.onClose();
                    toast.success("Success!"); //meeting request from 13.02.2019
                },
                error: (error) => {
                    this.onClose();
                    toast.error('Something goes wrong!'); //meeting request from 13.02.2019
                }
            });
        }
    };

    deleteProceed = account => {
        if (account) {
            $.ajax({
                url: `/api/account/delete-account/${account.account.id}`,
                type: 'DELETE',
                contentType: 'application/json; charset=UTF-8',
                success: (data) => {
                    alert("Success!");
                    this.setState({ activeSubview: null });
                },
                error: (error) => {
                    alert("We were unable to delete this account. Many times this is because it has bookings against it. Please open a support ticket.");
                    this.setState({ activeSubview: null });
                }
            });
        }
    };

    onClose = () => {
        if (this.refs.myRef) {
            this.setState({ activeSubview: null, reloadData: true });
        }

    };

    goToTermsPage = item => {
        if (!item || !item.termsVersion) return;
        const globalModalContext = this.context
        const { showVersionedTermsModal } = globalModalContext
        showVersionedTermsModal(item.termsVersion)
    };

    goToPolicyPage = item => {
        if (!item || !item.policyVersion) return;
        const globalModalContext = this.context
        const { showVersionedPrivacyModal } = globalModalContext
        showVersionedPrivacyModal(item.policyVersion)
    };

    render() {
        return (
            <div ref="myRef" className="h-100">
                {
                    this.state.activeSubview ?
                        this.state.activeSubview
                        :
                        null
                }

                <AccountReport
                    title="Accounts"
                    reloadData={this.state.reloadData}
                    getReportDataUrl={(account) => `api/account/references`}
                    reportFields={[
                        {
                            label: "Company Name",
                            name: "companyName"
                        },
                        {
                            label: "Account Id",
                            name: "id"
                        },
                        {
                            label: "Account Type",
                            name: "userType",
                            formatter: (value) => {
                                return (value === 'Supplier') ? 'Partner' : ((value === 'Buyer') ? 'Customer' : value);
                            },
                        },
                        {
                            label: "Total Bookings",
                            name: "totalBookings"
                        },
                        {
                            label: "Status",
                            name: "activated",
                            formatter: (value) => {
                                return value ? 'active' : 'inactive';
                            }
                        },
                        {
                            label: "Created On",
                            name: "createdOn"
                        },
                        {
                            label: "Terms Of Use Agreed On",
                            name: "termsAgreedToDate"
                        },
                        {
                            label: "Terms Of Use",
                            name: "termsVersion",
                            formatter: (value) => {
                                return value ? ("Version " + value) : "";
                            },
                            action: this.goToTermsPage
                        },
                        {
                            label: "Privacy Policy Agreed On",
                            name: "privacyPolicyAgreeToDate"
                        },
                        {
                            label: "Privacy Policy",
                            name: "policyVersion",
                            formatter: (value) => {
                                return value ? ("Version " + value) : "";
                            },
                            action: this.goToPolicyPage
                        }
                    ]}
                    account={this.state.account}
                    actionList={
                        [
                            {
                                displayValue: 'Delete!',
                                action: this.deleteAccountConfirm
                            },
                            {
                                displayValue: 'Proof for ToS',
                                action: this.goToTermsPage,

                            },
                            {
                                displayValue: 'Proof for PP',
                                action: this.goToPolicyPage,
                            },
                            {
                                displayValue: 'Change Status',
                                action: this.changeAccountConfirm,
                                shouldShowAction: (item) => {
                                    return (item.userType === 'Supplier');
                                }
                            },
                            {
                                displayValue: 'Change Account Type',
                                action: this.changeTypeConfirm,
                                shouldShowAction: (item) => {
                                    return (item.userType !== 'Admin');
                                }
                            }
                        ]
                    }
                />
            </div>
        );
    }
}

export default AdminAccountsReport;
