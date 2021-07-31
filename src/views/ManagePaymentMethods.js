import React, {Component} from 'react';
import '../css/views/managePaymentMethods.css';
import '../css/theme/mainContent.css';
import '../css/theme/forms.css';
import '../css/theme/forms-block.css';
import '../css/theme/buttons.css';
import '../css/components/badge.css';
import '../css/views/accountReport.css';
import '../css/views/search.css';
import {formatCurrencyValue, parseCurrencyValue, validateCurrencyValue} from "../util/PaymentUtils";
import {createLogoutOnFailureHandler, logout} from "../util/LogoutUtil";
import Busy from "../components/Busy";
import ReportRowAction from "../components/ReportRowAction";
import Error from "../components/Error";
import Select from "../components/Select";
import URLUtils from "../util/URLUtils";
import RedirectToPage from "../components/RedirectToPage";

const $ = window.$;

const CARD = "Card";
const ACH = "ACH";
const MICRO_DEPOSIT = "Micro Deposit";
const INSTANT = "Instant";
const ACCOUNT_TYPE_INDIVIDUAL_CHECKING = "Individual - Checking";
const ACCOUNT_TYPE_COMPANY_CHECKING = "Company - Checking";
const ACCOUNT_TYPE_INDIVIDUAL_SAVINGS = "Individual - Savings";
const ACCOUNT_TYPE_COMPANY_SAVINGS = "Company - Savings";

class ManagePaymentMethods extends Component {
    constructor(props) {
        super(props);

        let managePaymentMethods = URLUtils.getQueryVariable('managePaymentMethods') || this.props.managePaymentMethods;
        let showAddPaymentMethod = managePaymentMethods === 'true';

        this.state = {
            paymentMethods: [],
            paymentMethodToVerify: '',
            paymentMethodToRemove: '',
            paymentMethodToRename: '',
            newNickName: '',
            showAddPaymentMethod: showAddPaymentMethod,
            payWithAch: false,
            microDepositVerify: false,
            collectMicroDepositVerifyPayment: false,
            removePaymentMethodSuccess: false,
            bankAccountVerifySuccess: false,
            addPaymentMethodSuccess: false,
            addPaymentMethodErrorMessage: '',
            microDepositVerifyBankAccountHolderName: '',
            microDepositVerifyBankAccountHolderType: '',
            microDepositVerifyBankRoutingNumber: '',
            microDepositVerifyBankAccountNumber: '',
            microDepositVerifyBankAccountNumber2: '',
            microDepositAmount1: '',
            microDepositAmount2: '',
            bankAccountVerifyErrorMessage: '',
            removePaymentMethodErrorMessage: '',
            pageToNavTo: ''
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.account !== nextProps.account) {
            if (nextProps.account && nextProps.account.id) {
                this.loadStripe(this.createHandleStripeLoad(nextProps.account));
                this.loadStripeCheckout(this.createHandleStripeCheckoutLoad(nextProps.account));
                this.loadPlaid(this.createHandlePlaidLoad(nextProps.account));
                this.loadDwolla(this.createHandleDwollaLoad(nextProps.account));
            }
            this.loadPaymentMethods(nextProps.account ? nextProps.account.id : null);
        }
    }

    componentDidMount() {
        if (this.props.account && this.props.account.id) {
            this.loadStripe(this.createHandleStripeLoad(this.props.account));
            this.loadStripeCheckout(this.createHandleStripeCheckoutLoad(this.props.account));
            this.loadPlaid(this.createHandlePlaidLoad(this.props.account));
            this.loadDwolla(this.createHandleDwollaLoad(this.props.account));
        }
        this.loadPaymentMethods(this.props.account ? this.props.account.id : null);
    }

    componentWillUnmount() {
        if (this.stripeHandler) {
            this.stripeHandler.close();
        }
        if (this.plaidHandler) {
            this.plaidHandler.exit();
        }
    }

    createHandleStripeLoad(account) {
        let _this = this;
        return function () {
            _this.handleStripeLoad(account)
        }
    }

    loadStripe = (onload) => {
        if (!window.Stripe) {
            const script = document.createElement('script');
            script.onload = function () {
                onload();
            };
            script.src = 'https://js.stripe.com/v3/';
            document.head.appendChild(script);
        } else {
            onload();
        }
    };

    handleStripeLoad = (account) => {
        this.stripe = window.Stripe(account.platformPublishedKey);
    };

    createHandleStripeCheckoutLoad(account) {
        let _this = this;
        return function () {
            _this.handleStripeCheckoutLoad(account)
        }
    }

    loadStripeCheckout = (onload) => {
        if (!window.StripeCheckout) {
            const script = document.createElement('script');
            script.onload = function () {
                onload();
            };
            script.src = 'https://checkout.stripe.com/checkout.js';
            document.head.appendChild(script);
        } else {
            onload();
        }
    };

    handleStripeCheckoutLoad = (account) => {
        this.stripeHandler = window.StripeCheckout.configure({
            key: account.platformPublishedKey,
            image: "https://s3-us-west-1.amazonaws.com/securspace-files/app-images/favicon.ico",
            locale: "auto",
            zipCode: true,
            name: "Add Payment Method",
            panelLabel: "Add Payment Method",
            color: 'black',
            email: account.email,
            token: (token) => {
                Busy.set(true);
                $.ajax({
                    url: 'api/payment-method',
                    data: JSON.stringify({
                        accountId: this.props.account.id,
                        stripeToken: token.id,
                        paymentType: this.state.payWithAch ? "ACH" : "CARD"
                    }),
                    type: 'POST',
                    contentType: 'application/json; charset=UTF-8',
                    dataType: "json",
                    success: this.handleAddPaymentMethodSuccess,
                    statusCode: {
                        401: createLogoutOnFailureHandler(this.props.handleLogout)
                    },
                    error: this.handleAddPaymentMethodFailure
                });
            }
        });

        this.setState({
            stripeLoading: false,
            // loading needs to be explicitly set false so component will render in 'loaded' state.
            loading: false,
        });
    };

    createHandlePlaidLoad(account) {
        let _this = this;
        return function () {
            _this.handlePlaidLoad(account);
        }
    }

    loadPlaid = (onload) => {
        if (!window.Plaid) {
            const script = document.createElement('script');
            script.onload = function () {
                onload();
            };
            script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
            document.head.appendChild(script);
        } else {
            onload();
        }
    };

    handlePlaidLoad = (account) => {
        this.plaidHandler = window.Plaid.create({
            env: account.plaidEnvironment,
            clientName: account.plaidClientName,
            key: account.plaidPublicKey,
            product: ['auth'],
            selectAccount: true,
            onSuccess: (public_token, metadata) => {
                Busy.set(true);
                $.ajax({
                    url: 'api/payment-method',
                    data: JSON.stringify({
                        accountId: this.props.account.id,
                        plaidPublicToken: public_token,
                        plaidAccountId: metadata.account_id,
                        paymentType: this.state.payWithAch ? "ACH" : "CARD"
                    }),
                    type: 'POST',
                    contentType: 'application/json; charset=UTF-8',
                    dataType: "json",
                    success: this.handleAddPaymentMethodSuccess,
                    error: this.handleAddPaymentMethodFailure
                });
            },
            onExit: function (err, metadata) {
                // The user exited the Link flow.
                if (err != null) {
                    // The user encountered a Plaid API error prior to exiting.
                }
            },
        });

        this.setState({
            plaidLoading: false,
            // loading needs to be explicitly set false so component will render in 'loaded' state.
            loading: false,
        });
    };

    createHandleDwollaLoad(account) {
        let _this = this;
        return function () {
            _this.handleDwollaLoad(account)
        }
    }

    loadDwolla = (onload) => {
        if (!window.dwolla) {
            const script = document.createElement('script');
            script.onload = function () {
                onload();
            };
            script.src = 'https://cdn.dwolla.com/1/dwolla.min.js';
            document.head.appendChild(script);
        } else {
            onload();
        }
    };

    handleDwollaLoad = (account) => {
        this.dwolla = window.dwolla;
        this.dwolla.configure(account.dwollaEnv);
    };

    loadPaymentMethods(accountId) {
        if (accountId) {
            Busy.set(true);
            $.ajax({
                url: 'api/payment-method?accountId=' + accountId,
                type: 'GET',
                success: this.paymentMethodsLoaded,
                statusCode: {
                    401: createLogoutOnFailureHandler(this.props.handleLogout)
                },
                error: this.paymentMethodsFailedToLoad
            });
        }
    }

    paymentMethodsLoaded = data => {
        Busy.set(false);
        this.setState({paymentMethods: data});
    };

    paymentMethodsFailedToLoad = (jqXHR, textStatus, errorThrown) => {
        Busy.set(false);
        this.setState({errorMessage: "Failed to load payment methods."});

    };

    handleChange = event => {
        let name = event.target.name;
        let value = (event.target.type === 'checkbox') ? event.target.checked : event.target.value;
        if ('microDepositAmount1' === name || 'microDepositAmount2' === name) {
            if (!validateCurrencyValue(value)) {
                return;
            }
            value = parseCurrencyValue(value);
        }
        this.setState({[event.target.name]: value});
    };

    addNewFundingSource = updatedAccount => {
        this.setState({showNewFundingSourceDetails: !this.state.showNewFundingSourceDetails});
    };

    verifyBankAccount = () => {
        Busy.set(true);
        $.ajax({
            url: 'api/payment-method/verify',
            data: JSON.stringify({
                paymentMethodId: this.state.paymentMethodToVerify.id,
                microDeposit1: this.state.microDepositAmount1,
                microDeposit2: this.state.microDepositAmount2,
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: this.handleBankAccountVerifySuccess,
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: this.handleVerifyBankAccountFailure
        });
    };

    handleBankAccountVerifySuccess = (updatedPaymentMethod) => {
        Busy.set(false);
        this.setState({
            bankAccountVerifySuccess: true,
            bankAccountVerifyErrorMessage: ''
        });
        this.loadPaymentMethods(this.props.account.id);
    };

    handleVerifyBankAccountFailure = (jqXHR, textStatus, errorThrown) => {
        Busy.set(false);
        let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "";
        errorMessage = errorMessage ? errorMessage.trim() : errorMessage;
        this.setState({
            bankAccountVerifyErrorMessage: errorMessage ? errorMessage : "An error occurred while verifying this payment method."
        });
    };

    removePaymentMethod = () => {
        Busy.set(true);
        $.ajax({
            url: 'api/payment-method/deactivate',
            data: JSON.stringify({
                id: this.state.paymentMethodToRemove.id,
                accountId: this.state.paymentMethodToRemove.accountId
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            success: this.handleRemovePaymentMethodSuccess,
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: this.handleRemovePaymentMethodFailure
        });
    };

    handleRemovePaymentMethodSuccess = () => {
        Busy.set(false);
        this.setState({
            removePaymentMethodSuccess: true,
            removePaymentMethodErrorMessage: ''
        });
        this.loadPaymentMethods(this.props.account.id);
    };

    handleRemovePaymentMethodFailure = (jqXHR, textStatus, errorThrown) => {
        Busy.set(false);
        let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "";
        errorMessage = errorMessage ? errorMessage.trim() : errorMessage;
        this.setState({
            removePaymentMethodErrorMessage: errorMessage ? errorMessage : "An error occurred while removing this payment method."
        });
    };

    collectPaymentInfo = (e) => {
        e.preventDefault();
        if (this.state.payWithAch && this.state.microDepositVerify) {
            this.setState({
                collectMicroDepositVerifyPayment: true,
                addPaymentMethodSuccess: false
            });
        } else {
            this.collectInstantPayment(e);
        }
    };

    collectInstantPayment = (e) => {
        e.preventDefault();
        let _this = this;
        Busy.set(true);
        //Verify we are still logged in before processing payment
        $.ajax({
            url: 'api/current-username',
            type: 'GET',
            success: function (loggedInUsername) {
                Busy.set(false);
                //Only check again if we were successful
                if (loggedInUsername) {
                    _this.completeBookingWithInstantPayment();
                } else {
                    logout(_this.props.handleLogout, true);
                }
            },
            error: function () {
                Busy.set(false);
                logout(_this.props.handleLogout, true);
            }
        });
    };

    completeBookingWithInstantPayment = () => {
        if (this.state.payWithAch) {
            this.plaidHandler.open();
        } else {
            this.stripeHandler.open({
                name: "SecurSpace",
                // amount: this.state.initialBookingChargeAmount,
                description: "Add Payment Method"
            });
        }
    };

    addPaymentMethodWithMicroDepositVerification = e => {
        e.preventDefault();
        let _this = this;

        if (this.state.microDepositVerifyBankAccountNumber !== this.state.microDepositVerifyBankAccountNumber2) {
            this.setState({addPaymentMethodErrorMessage: "Re-entered bank account number does not match"})
            return;
        }

        Busy.set(true);

        let routingNumber = this.state.microDepositVerifyBankRoutingNumber;
        let accountNumber = this.state.microDepositVerifyBankAccountNumber;
        let accountType = this.state.microDepositVerifyBankAccountHolderType;

        let checkingOrSavings = accountType === ACCOUNT_TYPE_COMPANY_CHECKING || accountType === ACCOUNT_TYPE_INDIVIDUAL_CHECKING ? "checking" : "savings";

        let bankAccountLastFour = accountNumber.substring(accountNumber.length - 4, accountNumber.length);

        $.ajax({
            url: 'api/payment-method/token?accountId=' + this.props.account.id,
            type: 'GET',
            success: function (resp) {
                _this.dwolla.fundingSources.create(
                    resp.token,
                    {
                        routingNumber: routingNumber,
                        accountNumber: accountNumber,
                        type: checkingOrSavings,
                        name: bankAccountLastFour
                    }, function(err, res) {
                        if (err) {
                            Busy.set(false);
                            let errorMessage = "Error adding payment method.";
                            let embedded = err._embedded;
                            if (embedded) {
                                let embeddedErrors = embedded.errors;
                                if (embeddedErrors && embeddedErrors.length > 0) {
                                    let embeddedError = embeddedErrors[0];
                                    if (embeddedError) {
                                        errorMessage = embeddedError.message;
                                    }
                                }
                            }
                            _this.handleFailure(errorMessage);
                        } else {
                            let links = res['_links'];
                            let fundingSource = links['funding-source'];
                            let fundingSourceHref = fundingSource['href'];
                            let fundingSourceId = fundingSourceHref.substring(fundingSourceHref.lastIndexOf("/") + 1, fundingSourceHref.length);

                            $.ajax({
                                url: 'api/payment-method',
                                data: JSON.stringify({
                                    accountId: _this.props.account.id,
                                    paymentProcessor: 'DWOLLA',
                                    bankAccountNickName: bankAccountLastFour,
                                    dwollaFundingSourceId: fundingSourceId
                                }),
                                type: 'POST',
                                contentType: 'application/json; charset=UTF-8',
                                dataType: "json",
                                success: _this.handleAddPaymentMethodSuccess,
                                statusCode: {
                                    401: createLogoutOnFailureHandler(_this.props.handleLogout)
                                },
                                error: _this.handleAddPaymentMethodFailure
                            });
                        }
                    });
            },
            error: this.handleAddPaymentMethodFailure
        });
    };

    upgradeSpendingLimitWithMicroDepositVerification = e => {
        e.preventDefault();
        let _this = this;

        let accountType = this.state.microDepositVerifyBankAccountHolderType;
        let accountCompanyOrIndividual = accountType === ACCOUNT_TYPE_INDIVIDUAL_CHECKING || accountType === ACCOUNT_TYPE_INDIVIDUAL_SAVINGS ? "individual" : "company";

        if (this.state.microDepositVerifyBankAccountNumber !== this.state.microDepositVerifyBankAccountNumber2) {
            this.setState({addPaymentMethodErrorMessage: "Re-entered bank account number does not match"})
            return;
        }

        Busy.set(true);
        this.stripe.createToken('bank_account', {
            country: 'US',
            currency: 'usd',
            routing_number: this.state.microDepositVerifyBankRoutingNumber,
            account_number: this.state.microDepositVerifyBankAccountNumber,
            account_holder_name: this.state.microDepositVerifyBankAccountHolderName,
            account_holder_type: accountCompanyOrIndividual,
        }).then(function (result) {
            let error = result.error;
            if (error) {
                let errorMessage = error.message;
                Busy.set(false);
                _this.setState({
                    addPaymentMethodSuccess: "",
                    addPaymentMethodErrorMessage: errorMessage
                });
            } else {
                let token = result.token;
                $.ajax({
                    url: 'api/payment-method',
                    data: JSON.stringify({
                        accountId: _this.props.account.id,
                        stripeToken: token.id,
                        paymentType: _this.state.payWithAch || _this.state.brokeredBooking ? "ACH" : "CARD"
                    }),
                    type: 'POST',
                    contentType: 'application/json; charset=UTF-8',
                    dataType: "json",
                    success: _this.handleAddPaymentMethodSuccess,
                    statusCode: {
                        401: createLogoutOnFailureHandler(_this.props.handleLogout)
                    },
                    error: _this.handleAddPaymentMethodFailure
                });
            }
        });
    };

    handleAddPaymentMethodSuccess = (updatedBooking) => {
        Busy.set(false);
        this.setState((prevState) => ({
            addPaymentMethodSuccess: true,
            addPaymentMethodErrorMessage: ''
        }));
        this.loadPaymentMethods(this.props.account.id);
    };

    handleAddPaymentMethodFailure = (jqXHR, textStatus, errorThrown) => {
        let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "";
        this.handleFailure(errorMessage);
    };

    handleFailure = (errorMessage) => {
        Busy.set(false);
        errorMessage = errorMessage ? errorMessage.trim() : errorMessage;
        this.setState({
            addPaymentMethodSuccess: false,
            addPaymentMethodErrorMessage: errorMessage ? errorMessage : "An error occurred while adding this payment method."
        });
    };

    togglePayWithAch = (selected) => {
        if (ACH === selected && !this.state.payWithAch) {
            this.setState({payWithAch: true});
        } else if (CARD === selected && this.state.payWithAch) {
            this.setState({payWithAch: false});
        }
    };

    toggleMicroDepositVerify = (selected) => {
        if (MICRO_DEPOSIT === selected && !this.state.microDepositVerify) {
            this.setState({microDepositVerify: true});
        } else if (INSTANT === selected && this.state.microDepositVerify) {
            this.setState({microDepositVerify: false});
        }
    };

    selectPayWithCardClassName = () => {
        return "ss-button-primary-left" + (!this.state.payWithAch ? " ss-button-primary-selected" : " ss-button-primary-deselected");
    };

    selectPayWithAchClassName = () => {
        return "ss-button-primary-right" + (this.state.payWithAch ? " ss-button-primary-selected" : " ss-button-primary-deselected");
    };

    selectInstantVerifyClassName = () => {
        return "ss-button-primary-left" + (!this.state.microDepositVerify ? " ss-button-primary-selected" : " ss-button-primary-deselected");
    };

    selectMicroDepositVerifyClassName = () => {
        return "ss-button-primary-right" + (this.state.microDepositVerify ? " ss-button-primary-selected" : " ss-button-primary-deselected");
    };

    resetButton = () => {

        this.setState({
            showAddPaymentMethod: '',
            updatingPaymentMethod: '',
            collectMicroDepositVerifyPayment: '',
            addPaymentMethodSuccess: '',
            addPaymentMethodErrorMessage: '',
            microDepositVerifyBankAccountHolderName: '',
            microDepositVerifyBankAccountHolderType: '',
            microDepositVerifyBankRoutingNumber: '',
            microDepositVerifyBankAccountNumber: '',
            microDepositVerifyBankAccountNumber2: '',
            microDepositAmount1: '',
            microDepositAmount2: ''

        });
    };

    doneWithAddPaymentMethod() {
        if(this.props.navigateToView) {
            this.props.navigateToView()
        }

        return () => this.setState({
            showAddPaymentMethod: '',
            updatingPaymentMethod: '',
            collectMicroDepositVerifyPayment: '',
            addPaymentMethodSuccess: '',
            addPaymentMethodErrorMessage: '',
            microDepositVerifyBankAccountHolderName: '',
            microDepositVerifyBankAccountHolderType: '',
            microDepositVerifyBankRoutingNumber: '',
            microDepositVerifyBankAccountNumber: '',
            microDepositVerifyBankAccountNumber2: '',
            microDepositAmount1: '',
            microDepositAmount2: '',
            navToSearch: URLUtils.getQueryVariable('managePaymentMethods') === 'true',
            pageToNavTo: URLUtils.getQueryVariable('returnTo') ? URLUtils.getQueryVariable('returnTo') : ''
        });
    }

    renamePaymentMethod = () => {
        Busy.set(true);
        $.ajax({
            url: 'api/payment-method/rename',
            data: JSON.stringify({
                id: this.state.paymentMethodToRename.id,
                nickName: this.state.newNickName
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            success: this.handleRenamePaymentMethodSuccess,
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: this.handleRenamePaymentMethodFailure
        });
    }

    handleRenamePaymentMethodSuccess = () => {
        Busy.set(false);
        this.setState({
            renamePaymentMethodSuccess: true,
            renamePaymentMethodErrorMessage: ''
        });
        this.loadPaymentMethods(this.props.account.id);
    };

    handleRenamePaymentMethodFailure = (jqXHR, textStatus, errorThrown) => {
        Busy.set(false);
        let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "";
        errorMessage = errorMessage ? errorMessage.trim() : errorMessage;
        this.setState({
            renamePaymentMethodErrorMessage: errorMessage ? errorMessage : "An error occurred while renaming payment method."
        });
    };

    render() {
        return (
            <div id="manage-payment-methods" className="w100">
                <RedirectToPage redirectNow={this.state.pageToNavTo} page={this.state.pageToNavTo}/>
                <div className="custom-container">
                    {
                        this.state.paymentMethods.map((paymentMethod, index1) =>
                            <div key={index1} className="report-container">
                                <div className='report-row'>
                                    <div className='report-row-data' style={{flex: "1"}}>

                                        <div>
                                            <div className='report-label'>
                                                <label>TYPE:</label>
                                                <div className='report-value'>
                                                    {paymentMethod.bankName ? "Bank Account" : "Card"}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className='report-label'>
                                                <label>{paymentMethod.bankName ? "BANK NAME" : "BRAND"}:</label>
                                                <div className='report-value'>
                                                    {paymentMethod.bankName ? paymentMethod.bankName : paymentMethod.cardBrand}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className='report-label'>
                                                <label>LAST 4:</label>
                                                <div className='report-value'>
                                                    {paymentMethod.lastFour}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className='report-label'>
                                                <label>NICK NAME:</label>
                                                <div className='report-value'>
                                                    {paymentMethod.nickName}
                                                </div>
                                            </div>
                                        </div>

                                        {paymentMethod.expiresOn ?
                                            <div>
                                                <div className='report-label'>
                                                    <label>EXPIRES:</label>
                                                    <div className='report-value'>
                                                        {paymentMethod.expiresOn}
                                                    </div>
                                                </div>
                                            </div>
                                            :
                                            null
                                        }

                                        {(paymentMethod.stripeCustomerId && paymentMethod.stripeStatus && paymentMethod.stripeStatus !== 'verified') ||
                                        (paymentMethod.dwollaFundingSourceId && paymentMethod.dwollaStatus && paymentMethod.dwollaStatus !== 'verified') ?
                                            <div>
                                                <div className='report-label'>
                                                    <button
                                                        type="button"
                                                        onClick={() => this.setState({paymentMethodToVerify: paymentMethod})}
                                                        className="ss-button-primary">
                                                        Verify
                                                    </button>
                                                </div>
                                            </div>
                                            :
                                            null
                                        }

                                        <div className="ss-manage-payment-action">
                                            <ReportRowAction actions={
                                                [
                                                    {
                                                        displayValue: 'Remove',
                                                        action: ((paymentMethod) => this.setState({paymentMethodToRemove: paymentMethod}))
                                                    },
                                                    {
                                                        displayValue: 'Rename',
                                                        action: ((paymentMethod) => this.setState({paymentMethodToRename: paymentMethod}))
                                                    }
                                                ]
                                            } item={paymentMethod}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    <button
                        type="button"
                        onClick={() => this.setState({showAddPaymentMethod: true})}
                        className="add-payment-button ss-button-primary">Add Payment Method
                    </button>

                    {
                        this.state.paymentMethodToRemove ?
                            <div className="unselectable">

                                <div className="modal-dialog">
                                    <div className="modal-content ">

                                        <div className="popup-header">
                                            <h1>Remove Payment Method</h1>
                                            <button type="button" className="close pull-right"
                                                    aria-label="Close"
                                                    onClick={() => this.setState({
                                                        paymentMethodToRemove: '',
                                                        removePaymentMethodSuccess: '',
                                                        removePaymentMethodErrorMessage: ''
                                                    })}>
                                                <img alt="" src="../app-images/close.png"/>
                                            </button>
                                        </div>

                                        <form className="ss-form ss-block">

                                            {
                                                this.state.removePaymentMethodSuccess ?
                                                    <div>
                                                        <div className="modal-body">
                                                            <h4 className="ss-summary">PAYMENT METHOD REMOVED
                                                                SUCCESSFULLY</h4>
                                                        </div>
                                                        <div className="modal-footer">
                                                            <div className="table text-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => this.setState({
                                                                        paymentMethodToRemove: '',
                                                                        removePaymentMethodSuccess: '',
                                                                        removePaymentMethodErrorMessage: ''
                                                                    })}
                                                                    className="ss-button-primary">Done
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    :
                                                    <div>
                                                        <div className="modal-body">
                                                            <h4 className="ss-summary"><b>Are you sure you want to
                                                                remove
                                                                payment
                                                                method
                                                                ending
                                                                in {this.state.paymentMethodToRemove.lastFour}?</b>
                                                            </h4>
                                                            {
                                                                this.state.removePaymentMethodErrorMessage ?
                                                                    <Error>{this.state.removePaymentMethodErrorMessage}</Error> : ''
                                                            }
                                                        </div>

                                                        <div className="modal-footer">
                                                            <div className="table text-center">
                                                                <button type="button"
                                                                        onClick={() => this.setState({
                                                                            paymentMethodToRemove: ''
                                                                        })}
                                                                        className="ss-button-secondary">No
                                                                </button>
                                                                <button type="button"
                                                                        onClick={this.removePaymentMethod}
                                                                        className="ss-button-primary">Yes
                                                                </button>
                                                            </div>
                                                        </div>

                                                    </div>
                                            }
                                        </form>
                                    </div>
                                </div>
                            </div>
                            :
                            null
                    }

                    {
                        this.state.paymentMethodToRename ?
                            <div className="unselectable">
                                <div className="modal-dialog">
                                    <div className="modal-content ">
                                        <div className="popup-header">
                                            <h1>Rename Payment Method</h1>
                                            <button type="button" className="close pull-right"
                                                    aria-label="Close"
                                                    onClick={() => this.setState({
                                                        paymentMethodToRename: '',
                                                        renamePaymentMethodSuccess: '',
                                                        renamePaymentMethodErrorMessage: ''
                                                    })}>
                                                <img alt="" src="../app-images/close.png"/>
                                            </button>
                                        </div>
                                        <form className="ss-form ss-block">
                                            {
                                                this.state.renamePaymentMethodSuccess ?
                                                    <div>
                                                        <div className="modal-body">
                                                            <h3>PAYMENT METHOD RENAMED SUCCESSFULLY</h3>
                                                            <br/>
                                                        </div>
                                                        <div className="modal-footer">
                                                            <div className="table text-center">
                                                                <button type="button"
                                                                        onClick={() => this.setState({
                                                                            paymentMethodToRename: '',
                                                                            renamePaymentMethodSuccess: '',
                                                                            renamePaymentMethodErrorMessage: '',
                                                                            newNickName: ''
                                                                        })}
                                                                        className="ss-button-primary">Done
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    :
                                                    <div id="renamePaymentMethod">
                                                        <div className="modal-body">
                                                            <h4 className="ss-summary">
                                                                Enter New Nick Name For Payment Method
                                                            </h4>
                                                            <fieldset className="ss-stand-alone">
                                                                <label htmlFor="microDepositAmount1">NICK NAME</label>
                                                                <input type="text"
                                                                       id="newNickName"
                                                                       name="newNickName"
                                                                       value={this.state.newNickName}
                                                                       onChange={this.handleChange}
                                                                       maxLength={30}
                                                                       placeholder="Enter a new nick name"
                                                                />
                                                            </fieldset>
                                                            {
                                                                this.state.renamePaymentMethodErrorMessage ?
                                                                    <Error>{this.state.renamePaymentMethodErrorMessage}</Error> : ''
                                                            }
                                                        </div>
                                                        <div className="modal-footer">
                                                            <div className="table text-center">
                                                                <button type="button"
                                                                        onClick={this.renamePaymentMethod}
                                                                        className="ss-button-primary">
                                                                    Rename Payment Method
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                            }
                                        </form>
                                    </div>
                                </div>
                            </div>
                            :
                            null
                    }

                    {
                        this.state.paymentMethodToVerify ?
                            <div className="unselectable">
                                <div className="modal-dialog">
                                    <div className="modal-content ">
                                        <div className="popup-header">
                                            <h1>Verify Bank
                                                Account</h1>
                                            <button type="button" className="close pull-right"
                                                    aria-label="Close"
                                                    onClick={() => this.setState({
                                                        paymentMethodToVerify: '',
                                                        bankAccountVerifySuccess: '',
                                                        bankAccountVerifyErrorMessage: ''
                                                    })}>
                                                <img alt="" src="../app-images/close.png"/>
                                            </button>
                                        </div>
                                        <form className="ss-form ss-block">
                                            {
                                                this.state.bankAccountVerifySuccess ?
                                                    <div>
                                                        <div className="modal-body">
                                                            <h3>BANK ACCOUNT VERIFIED SUCCESSFULLY</h3>
                                                            <br/>
                                                            <ul>
                                                                <li><p>This payment method is now fully verified.</p>
                                                                </li>
                                                                <li><p>You may now use this payment method to pay for
                                                                    Bookings.</p>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                        <div className="modal-footer">
                                                            <div className="table text-center">
                                                                <button type="button"
                                                                        onClick={() => this.setState({
                                                                            paymentMethodToVerify: '',
                                                                            bankAccountVerifySuccess: '',
                                                                            bankAccountVerifyErrorMessage: '',
                                                                            microDepositVerifyBankAccountHolderName: '',
                                                                            microDepositVerifyBankAccountHolderType: '',
                                                                            microDepositVerifyBankRoutingNumber: '',
                                                                            microDepositVerifyBankAccountNumber: '',
                                                                            microDepositVerifyBankAccountNumber2: '',
                                                                            microDepositAmount1: '',
                                                                            microDepositAmount2: '',
                                                                        })}
                                                                        className="ss-button-primary">Done
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    :
                                                    <div id="verifyBankAccount">
                                                        <div className="modal-body">
                                                            <h4 className="ss-summary">
                                                                Enter Bank Account Deposit Amounts
                                                            </h4>
                                                            <p className="ss-details">
                                                                &nbsp;&bull;&nbsp;&nbsp; Two deposits were made into your bank account
                                                                <br/>
                                                                &nbsp;&bull;&nbsp;&nbsp; Deposit amounts are less than $.10
                                                                <br/>
                                                                &nbsp;&bull;&nbsp;&nbsp; Deposits take 1-2 days to appear
                                                            </p>
                                                            <fieldset className="ss-stand-alone">
                                                                <label htmlFor="microDepositAmount1">FIRST DEPOSIT AMOUNT</label>
                                                                <input type="text"
                                                                       id="microDepositAmount1"
                                                                       name="microDepositAmount1"
                                                                       value={formatCurrencyValue(this.state.microDepositAmount1)}
                                                                       onChange={this.handleChange}
                                                                       maxLength={10}
                                                                       placeholder="Enter first micro deposit amount"
                                                                />
                                                            </fieldset>
                                                            <fieldset className="ss-stand-alone">
                                                                <label htmlFor="microDepositAmount2">SECOND DEPOSIT AMOUNT</label>
                                                                <input type="text"
                                                                       id="microDepositAmount2"
                                                                       name="microDepositAmount2"
                                                                       value={formatCurrencyValue(this.state.microDepositAmount2)}
                                                                       onChange={this.handleChange}
                                                                       maxLength={10}
                                                                       placeholder="Enter second micro deposit amount"
                                                                />
                                                            </fieldset>
                                                            {
                                                                this.state.bankAccountVerifyErrorMessage ?
                                                                    <Error>{this.state.bankAccountVerifyErrorMessage}</Error> : ''
                                                            }
                                                        </div>
                                                        <div className="modal-footer">
                                                            <div className="table text-center">
                                                                <button type="button"
                                                                        onClick={this.verifyBankAccount}
                                                                        className="ss-button-primary">
                                                                    Verify Bank Account
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                            }
                                        </form>
                                    </div>
                                </div>
                            </div>
                            :
                            null
                    }

                    {
                        this.state.showAddPaymentMethod ?
                            <div className="unselectable">
                                <div className="modal-dialog">
                                    <div className="modal-content ">
                                        <div className="popup-header">
                                            <h1>Add Payment Method</h1>
                                            <button type="button" className="close pull-right"
                                                    aria-label="Close"
                                                    onClick={this.resetButton}>
                                                <img alt="" src="../app-images/close.png"/>
                                            </button>
                                        </div>

                                        <form className="ss-form ss-block no-padding">
                                            {
                                                this.state.addPaymentMethodSuccess && this.state.collectMicroDepositVerifyPayment ?
                                                    <div id="ss-verification-still-required">
                                                        <div className="modal-body">
                                                            <h3>BANK ACCOUNT VERIFICATION STILL REQUIRED</h3>
                                                            <br/>
                                                            <ul>
                                                                <li><p>You are 1 step away from completing the process of adding this payment method.</p></li>
                                                                <li><p>You must now verify your bank account by confirming 2 micro deposit amounts.</p></li>
                                                                <li><p>Two small deposits will be made into your bank account within 1-2 days.</p></li>
                                                                <li><p>The deposit amounts will be less than $0.10.</p></li>
                                                                <li><p>Once you see the deposits, come back to this page and click the "Verify" button.</p></li>
                                                                <li><p>Follow the remaining steps to verify and you're all done!</p></li>
                                                            </ul>
                                                        </div>
                                                        <div className="modal-footer">
                                                            <div className="table text-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={this.doneWithAddPaymentMethod()}
                                                                    className="ss-button-primary">Done
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    :
                                                    this.state.addPaymentMethodSuccess ?
                                                        <div>
                                                            <div className="modal-body">
                                                                <h3>PAYMENT METHOD ADDED SUCCESSFULLY</h3>
                                                                <br/>
                                                                <ul>
                                                                    <li><p>This payment method has been added to your
                                                                        account.</p></li>
                                                                    <li><p>You may now use this payment method to pay
                                                                        for
                                                                        Bookings.</p></li>
                                                                </ul>
                                                            </div>
                                                            <div className="modal-footer">
                                                                <div className="table text-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={this.doneWithAddPaymentMethod()}
                                                                        className="ss-button-primary">Done
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        :
                                                        this.state.collectMicroDepositVerifyPayment ?
                                                            <div id="collectMicroDepositVerifyPayment">
                                                                <div className="modal-body">
                                                                    <h4 className="ss-summary"><b>Enter Bank Account
                                                                        Details</b></h4>
                                                                    <fieldset className="ss-stand-alone">
                                                                        <label
                                                                            htmlFor="microDepositVerifyBankAccountHolderName">ACCOUNT
                                                                            HOLDER FULL NAME</label>
                                                                        <input type="text"
                                                                               id="microDepositVerifyBankAccountHolderName"
                                                                               name="microDepositVerifyBankAccountHolderName"
                                                                               placeholder="Enter the full name of the person who holds this account"
                                                                               value={this.state.microDepositVerifyBankAccountHolderName}
                                                                               onChange={this.handleChange}
                                                                        />
                                                                    </fieldset>
                                                                    <fieldset className="ss-stand-alone">
                                                                        <label>ACCOUNT TYPE</label>
                                                                        <Select
                                                                            id="microDepositVerifyBankAccountHolderType"
                                                                            name="microDepositVerifyBankAccountHolderType"
                                                                            className="ss-bank-account-type"
                                                                            handleChange={this.handleChange}
                                                                            selectedOption={this.state.microDepositVerifyBankAccountHolderType}
                                                                            placeholder="Choose"
                                                                            options={[
                                                                                ACCOUNT_TYPE_INDIVIDUAL_CHECKING,
                                                                                ACCOUNT_TYPE_COMPANY_CHECKING,
                                                                                ACCOUNT_TYPE_INDIVIDUAL_SAVINGS,
                                                                                ACCOUNT_TYPE_COMPANY_SAVINGS
                                                                            ]}
                                                                        />
                                                                    </fieldset>
                                                                    <fieldset className="ss-stand-alone">
                                                                        <label
                                                                            htmlFor="microDepositVerifyBankRoutingNumber">ROUTING
                                                                            NUMBER</label>
                                                                        <input type="text"
                                                                               id="microDepositVerifyBankRoutingNumber"
                                                                               name="microDepositVerifyBankRoutingNumber"
                                                                               placeholder="Enter your bank's routing number"
                                                                               value={this.state.microDepositVerifyBankRoutingNumber}
                                                                               onChange={this.handleChange}
                                                                        />
                                                                    </fieldset>
                                                                    <fieldset className="ss-stand-alone">
                                                                        <label
                                                                            htmlFor="microDepositVerifyBankAccountNumber">ACCOUNT
                                                                            NUMBER</label>
                                                                        <input type="text"
                                                                               id="microDepositVerifyBankAccountNumber"
                                                                               name="microDepositVerifyBankAccountNumber"
                                                                               placeholder="Enter your bank account number"
                                                                               value={this.state.microDepositVerifyBankAccountNumber}
                                                                               onChange={this.handleChange}
                                                                        />
                                                                    </fieldset>
                                                                    <fieldset className="ss-stand-alone">
                                                                        <label
                                                                            htmlFor="microDepositVerifyBankAccountNumber2">RE-ENTER
                                                                            ACCOUNT NUMBER</label>
                                                                        <input type="text"
                                                                               id="microDepositVerifyBankAccountNumber2"
                                                                               name="microDepositVerifyBankAccountNumber2"
                                                                               placeholder="Re-enter your bank account number"
                                                                               value={this.state.microDepositVerifyBankAccountNumber2}
                                                                               onChange={this.handleChange}
                                                                        />
                                                                    </fieldset>

                                                                    {
                                                                        this.state.addPaymentMethodErrorMessage ?
                                                                            <Error>{this.state.addPaymentMethodErrorMessage}</Error> : ''
                                                                    }
                                                                </div>
                                                                <div className="modal-footer">
                                                                    <div className="table text-center">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => this.setState({
                                                                                collectMicroDepositVerifyPayment: '',
                                                                                addPaymentMethodSuccess: '',
                                                                                addPaymentMethodErrorMessage: ''
                                                                            })}
                                                                            className="ss-button-secondary">Back
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={this.addPaymentMethodWithMicroDepositVerification}
                                                                            className="ss-button-primary">Next
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            :
                                                            <div id="selectPaymentMethod">
                                                                <div className="modal-body">
                                                                    <h4 className="ss-summary">Select Payment
                                                                        Method</h4>
                                                                    <p className="help-block">
                                                                        <button type="button"
                                                                                id="selectPayWithCardButton"
                                                                                className={this.selectPayWithCardClassName()}
                                                                                onClick={() => this.togglePayWithAch(CARD)}>
                                                                            Pay with card
                                                                        </button>
                                                                        <button type="button"
                                                                                id="selectPayWithAchButton"
                                                                                className={this.selectPayWithAchClassName()}
                                                                                onClick={() => this.togglePayWithAch(ACH)}>
                                                                            Pay with ACH
                                                                        </button>
                                                                    </p>

                                                                    {
                                                                        !this.state.payWithAch ?
                                                                            <p className="help-block">
                                                                                <span
                                                                                    className="glyphicon glyphicon-info-sign"/>
                                                                                Additional credit card processing fee
                                                                                applies
                                                                            </p>
                                                                            :
                                                                            ''
                                                                    }


                                                                    {
                                                                        this.state.payWithAch ?
                                                                            <div>
                                                                                <br/>
                                                                                <h4 className="ss-summary">Select Bank Account Verify Method</h4>
                                                                                <div>
                                                                                    <button type="button"
                                                                                            id="selectInstantVerify"
                                                                                            className={this.selectInstantVerifyClassName()}
                                                                                            onClick={() => this.toggleMicroDepositVerify(INSTANT)}>
                                                                                        Instant
                                                                                    </button>
                                                                                    <button type="button"
                                                                                            id="selectMicroDepositVerify"
                                                                                            className={this.selectMicroDepositVerifyClassName()}
                                                                                            onClick={() => this.toggleMicroDepositVerify(MICRO_DEPOSIT)}>
                                                                                        Micro Deposit
                                                                                    </button>
                                                                                    <p className="ss-details">
                                                                                        <b>Instant</b>
                                                                                        <br/>
                                                                                        &nbsp;&bull;&nbsp;&nbsp;Requires you to enter your Online Banking credentials
                                                                                        <br/>
                                                                                        &nbsp;&bull;&nbsp;&nbsp;Not supported with some local banks
                                                                                        <br/>
                                                                                        <b>Micro Deposit</b>
                                                                                        <br/>
                                                                                        &nbsp;&bull;&nbsp;&nbsp;Requires you to enter your bank account info
                                                                                        <br/>
                                                                                        &nbsp;&bull;&nbsp;&nbsp;Takes a few days to complete
                                                                                        <br/>
                                                                                        &nbsp;&bull;&nbsp;&nbsp;Supported with all banks
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            :
                                                                            ''
                                                                    }
                                                                    {
                                                                        this.state.addPaymentMethodErrorMessage ?
                                                                            <Error>{this.state.addPaymentMethodErrorMessage}</Error> : ''
                                                                    }
                                                                </div>
                                                                <div className="on-demand-agreement">
                                                                    <h4 className="ss-summary">Authorization Agreement</h4>
                                                                    <p className="ss-details">
                                                                        I agree that all future payments to or facilitated by SecūrSpace will be processed by
                                                                        the Dwolla or Stripe payment systems from the account I select for this payment method. In order
                                                                        to cancel this authorization, I will change my payment settings within my SecūrSpace account.
                                                                    </p>
                                                                </div>
                                                                <div className="modal-footer">
                                                                    <div className="table text-center">
                                                                        <button type="button"
                                                                                onClick={this.collectPaymentInfo}
                                                                                className="ss-button-primary">Agree & Continue
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                            }
                                        </form>
                                    </div>
                                </div>
                            </div>
                            :
                            null
                    }
                    {
                        this.state.showUpgradePaymentMethod ?
                            <div className="unselectable">
                                <div className="modal-dialog">
                                    <div className="modal-content ">
                                        <div className="popup-header">
                                            <h1>Add Payment Method</h1>
                                            <button type="button" className="close pull-right"
                                                    aria-label="Close"
                                                    onClick={this.resetButton}>
                                                <img alt="" src="../app-images/close.png"/>
                                            </button>
                                        </div>

                                        <form className="ss-form ss-block no-padding">
                                            {
                                                this.state.addPaymentMethodSuccess && this.state.collectMicroDepositVerifyPayment ?
                                                    <div id="ss-verification-still-required">
                                                        <div className="modal-body">
                                                            <h3>BANK ACCOUNT VERIFICATION STILL REQUIRED</h3>
                                                            <br/>
                                                            <ul>
                                                                <li><p>You are 1 step away from completing the process of adding this payment method.</p></li>
                                                                <li><p>You must now verify your bank account by confirming 2 micro deposit amounts.</p></li>
                                                                <li><p>Two small deposits will be made into your bank account within 1-2 days.</p></li>
                                                                <li><p>The deposit amounts will be less than $1.</p></li>
                                                                <li><p>The deposits will have a statement description of AMNTS: 2 deposit amounts.</p></li>
                                                                <li><p>Once you see the deposits, come back to this page and click the "Verify" button.</p></li>
                                                            </ul>
                                                        </div>
                                                        <div className="modal-footer">
                                                            <div className="table text-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={this.doneWithAddPaymentMethod()}
                                                                    className="ss-button-primary">Done
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    :
                                                    this.state.addPaymentMethodSuccess ?
                                                        <div>
                                                            <div className="modal-body">
                                                                <h3>PAYMENT METHOD ADDED SUCCESSFULLY</h3>
                                                                <br/>
                                                                <ul>
                                                                    <li><p>This payment method has been added to your
                                                                        account.</p></li>
                                                                    <li><p>You may now use this payment method to pay
                                                                        for
                                                                        Bookings.</p></li>
                                                                </ul>
                                                            </div>
                                                            <div className="modal-footer">
                                                                <div className="table text-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={this.doneWithAddPaymentMethod()}
                                                                        className="ss-button-primary">Done
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        :
                                                        this.state.collectMicroDepositVerifyPayment ?
                                                            <div id="collectMicroDepositVerifyPayment">
                                                                <div className="modal-body">
                                                                    <h4 className="ss-summary"><b>Enter Bank Account
                                                                        Details</b></h4>
                                                                    <fieldset className="ss-stand-alone">
                                                                        <label
                                                                            htmlFor="microDepositVerifyBankAccountHolderName">ACCOUNT
                                                                            HOLDER FULL NAME</label>
                                                                        <input type="text"
                                                                               id="microDepositVerifyBankAccountHolderName"
                                                                               name="microDepositVerifyBankAccountHolderName"
                                                                               placeholder="Enter the full name of the person who holds this account"
                                                                               value={this.state.microDepositVerifyBankAccountHolderName}
                                                                               onChange={this.handleChange}
                                                                        />
                                                                    </fieldset>
                                                                    <fieldset className="ss-stand-alone">
                                                                        <label>ACCOUNT TYPE</label>
                                                                        <Select
                                                                            id="microDepositVerifyBankAccountHolderType"
                                                                            name="microDepositVerifyBankAccountHolderType"
                                                                            className="ss-bank-account-type"
                                                                            handleChange={this.handleChange}
                                                                            selectedOption={this.state.microDepositVerifyBankAccountHolderType}
                                                                            placeholder="Choose"
                                                                            options={["Individual", "Company"]}
                                                                        />
                                                                    </fieldset>
                                                                    <fieldset className="ss-stand-alone">
                                                                        <label
                                                                            htmlFor="microDepositVerifyBankRoutingNumber">ROUTING
                                                                            NUMBER</label>
                                                                        <input type="text"
                                                                               id="microDepositVerifyBankRoutingNumber"
                                                                               name="microDepositVerifyBankRoutingNumber"
                                                                               placeholder="Enter your bank's routing number"
                                                                               value={this.state.microDepositVerifyBankRoutingNumber}
                                                                               onChange={this.handleChange}
                                                                        />
                                                                    </fieldset>
                                                                    <fieldset className="ss-stand-alone">
                                                                        <label
                                                                            htmlFor="microDepositVerifyBankAccountNumber">ACCOUNT
                                                                            NUMBER</label>
                                                                        <input type="text"
                                                                               id="microDepositVerifyBankAccountNumber"
                                                                               name="microDepositVerifyBankAccountNumber"
                                                                               placeholder="Enter your bank account number"
                                                                               value={this.state.microDepositVerifyBankAccountNumber}
                                                                               onChange={this.handleChange}
                                                                        />
                                                                    </fieldset>
                                                                    <fieldset className="ss-stand-alone">
                                                                        <label
                                                                            htmlFor="microDepositVerifyBankAccountNumber2">RE-ENTER
                                                                            ACCOUNT NUMBER</label>
                                                                        <input type="text"
                                                                               id="microDepositVerifyBankAccountNumber2"
                                                                               name="microDepositVerifyBankAccountNumber2"
                                                                               placeholder="Re-enter your bank account number"
                                                                               value={this.state.microDepositVerifyBankAccountNumber2}
                                                                               onChange={this.handleChange}
                                                                        />
                                                                    </fieldset>

                                                                    {
                                                                        this.state.addPaymentMethodErrorMessage ?
                                                                            <Error>{this.state.addPaymentMethodErrorMessage}</Error> : ''
                                                                    }
                                                                </div>
                                                                <div className="modal-footer">
                                                                    <div className="table text-center">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => this.setState({
                                                                                collectMicroDepositVerifyPayment: '',
                                                                                addPaymentMethodSuccess: '',
                                                                                addPaymentMethodErrorMessage: ''
                                                                            })}
                                                                            className="ss-button-secondary">Back
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={this.addPaymentMethodWithMicroDepositVerification}
                                                                            className="ss-button-primary">Next
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            :
                                                            <div id="selectPaymentMethod">
                                                                <div className="modal-body">
                                                                    <h4 className="ss-summary">Select Payment
                                                                        Method</h4>
                                                                    <p className="help-block">
                                                                        <button type="button"
                                                                                id="selectPayWithCardButton"
                                                                                className={this.selectPayWithCardClassName()}
                                                                                onClick={() => this.togglePayWithAch(CARD)}>
                                                                            Pay with card
                                                                        </button>
                                                                        <button type="button"
                                                                                id="selectPayWithAchButton"
                                                                                className={this.selectPayWithAchClassName()}
                                                                                onClick={() => this.togglePayWithAch(ACH)}>
                                                                            Pay with ACH
                                                                        </button>
                                                                    </p>

                                                                    {
                                                                        !this.state.payWithAch ?
                                                                            <p className="help-block">
                                                                                <span
                                                                                    className="glyphicon glyphicon-info-sign"/>
                                                                                Additional credit card processing fee
                                                                                applies
                                                                            </p>
                                                                            :
                                                                            ''
                                                                    }


                                                                    {
                                                                        this.state.payWithAch ?
                                                                            <div>
                                                                                <h4 className="ss-summary">Select Bank Account Verify Method</h4>
                                                                                <div>
                                                                                    <button type="button"
                                                                                            id="selectInstantVerify"
                                                                                            className={this.selectInstantVerifyClassName()}
                                                                                            onClick={() => this.toggleMicroDepositVerify(INSTANT)}>
                                                                                        Instant
                                                                                    </button>
                                                                                    <button type="button"
                                                                                            id="selectMicroDepositVerify"
                                                                                            className={this.selectMicroDepositVerifyClassName()}
                                                                                            onClick={() => this.toggleMicroDepositVerify(MICRO_DEPOSIT)}>
                                                                                        Micro Deposit
                                                                                    </button>
                                                                                    <p className="ss-details">
                                                                                        <b>Instant</b>
                                                                                        <br/>
                                                                                        &nbsp;&bull;&nbsp;&nbsp;Requires you to enter your Online Banking credentials
                                                                                        <br/>
                                                                                        &nbsp;&bull;&nbsp;&nbsp;Not supported with some local banks
                                                                                        <br/>
                                                                                        <b>Micro Deposit</b>
                                                                                        <br/>
                                                                                        &nbsp;&bull;&nbsp;&nbsp;Requires you to enter your bank account info
                                                                                        <br/>
                                                                                        &nbsp;&bull;&nbsp;&nbsp;Takes a few days to complete
                                                                                        <br/>
                                                                                        &nbsp;&bull;&nbsp;&nbsp;Supported with all banks
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            :
                                                                            ''
                                                                    }
                                                                    {
                                                                        this.state.addPaymentMethodErrorMessage ?
                                                                            <Error>{this.state.addPaymentMethodErrorMessage}</Error> : ''
                                                                    }
                                                                </div>
                                                                <div className="modal-footer">
                                                                    <div className="table text-center">
                                                                        <button type="button"
                                                                                onClick={this.collectPaymentInfo}
                                                                                className="ss-button-primary">Next
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                            }
                                        </form>
                                    </div>
                                </div>
                            </div>
                            :
                            null
                    }
                </div>
            </div>
        );
    }
}

export default ManagePaymentMethods;
