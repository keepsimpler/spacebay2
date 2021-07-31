import React, {Component} from 'react';
import CompanyDetails from "./CompanyDetails";
import '../css/views/companyProfile.css';
import BankAccountInfo from "./BankAccountInfo";
import ManagePaymentMethods from "./ManagePaymentMethods";
import URLUtils from "../util/URLUtils";
import { AccountType } from '../components/constants/securspace-constants';


const VIEW_NAME_COMPANY = "Company";
const VIEW_NAME_BANK_ACCOUNT = "Payout Account";
const VIEW_NAME_PAYMENT_METHODS = "Payment Methods";
const BUYER_ACCOUNT_VIEW_OPTIONS = ['company', 'payment methods'];
const DEFAULT_ACCOUNT_VIEW_OPTIONS = ['company', 'payout bank account'];

class CompanyProfile extends Component {
    constructor(props) {
        super(props);

        let managePaymentMethods = URLUtils.getQueryVariable('managePaymentMethods');
        let initialViewIndex = managePaymentMethods === 'true' ? 1 : 0;

        this.state = {
            account: this.props.account ? this.props.account : {},
            initialViewIndex: initialViewIndex,
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.state.account !== nextProps.account) {
            this.setState({account: nextProps.account});
        }
    }

    handleAccountUpdated = updatedAccount => {
        this.setState({account: updatedAccount});
        this.props.handleAccountUpdated(updatedAccount);
    };

    render() {

        let companyDetails = (
            <CompanyDetails account={this.state.account}
                            handleLogout={this.props.handleLogout}
                            handleAccountUpdated={this.handleAccountUpdated}
            />
        );

        let bankAccountInfo = (
            <BankAccountInfo account={this.state.account}
                             handleLogout={this.props.handleLogout}
                             handleAccountUpdated={this.handleAccountUpdated}/>
        );

        let managePaymentMethods = (
            <ManagePaymentMethods account={this.state.account}
                                  handleLogout={this.props.handleLogout}
                                  handleAccountUpdated={this.handleAccountUpdated}/>
        );

        let companyView = {
            name: VIEW_NAME_COMPANY,
            view: companyDetails
        };

        let bankAccountInfoView = {
            name: VIEW_NAME_BANK_ACCOUNT,
            view: bankAccountInfo
        };

        let managePaymentMethodsView = {
            name: VIEW_NAME_PAYMENT_METHODS,
            view: managePaymentMethods
        };

        let views = this.state.account.type === AccountType.BUYER ?
            [companyView, managePaymentMethodsView]
            :
            [companyView, bankAccountInfoView];


        let viewsLi = this.state.account.type === AccountType.BUYER ?
            BUYER_ACCOUNT_VIEW_OPTIONS
            :
            DEFAULT_ACCOUNT_VIEW_OPTIONS


        return (
            <div id="ssCompanyProfile" className="company grey-bg hs-bookings-container h-100">
                <div>
                    <header>
                        <ul className="breadcrumb">
                            <li>Account</li>
                            <li>edit your profile</li>
                        </ul>
                        <h1 className="content-header-title">Company Profile</h1>
                    </header>

                    <div className="white-container">
                        <div className="row-no-gutters">
                            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12 sm-overflow">
                                <ul className="user-menu dtable center-block">
                                    {
                                        viewsLi.map((item,index) =>
                                            <li
                                                key={'li'+index}
                                                className={'pointer users-'+item+(index===this.state.initialViewIndex ? ' active':'')}
                                                onClick={ ()=> this.setState({'initialViewIndex': index}) }>
                                                <span>{item}</span>
                                            </li>
                                        )
                                    }
                                </ul>
                            </div>
                        </div>
                        {
                            views.map((view, index) =>
                                this.state.initialViewIndex===index ?
                                    <div className="row-no-gutters" key={index}>
                                        {view.view}
                                    </div>
                                    :
                                    null
                            )
                        }
                    </div>
                </div>



            </div>
        );
    }
}

export default CompanyProfile;
