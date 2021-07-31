import React, {Component} from 'react';
import {createLogoutOnFailureHandler} from '../util/LogoutUtil';
import '../css/views/booking-common.css';
import '../css/theme/mainContent.css';
import '../css/theme/forms.css';
import '../css/theme/forms-block.css';
import '../css/theme/buttons.css';
import '../css/components/bookedSpaces.css';
import {formatCurrencyValue, parseCurrencyValue, validateCurrencyValue} from '../util/PaymentUtils';
import Busy from "../components/Busy";
import ErrorAlert from "../components/ErrorAlert";
import URLUtils from "../util/URLUtils";
import Error from "../components/Error";
import {Link} from "react-router-dom";
import BookingListItem from "../components/BookingListItem";
import ReviewPaymentAmounts from "../components/bookedSpaces/reviewPaymentAmounts";
import {toast} from "react-toastify";

import UpdatePaymentMethodModal
    from "../components/bookedSpaces/update-booking-payment-method/UpdatePaymentMethodModal";

import ConfirmDialog from "../components/ConfirmDialog";

const $ = window.$;

class BookedSpaces extends Component {
    constructor(props) {
        super(props);

        let initialSearchText = URLUtils.getQueryVariable('bookingNumber');
        if (!initialSearchText) {
            initialSearchText = '';
        }

        this.state = {
            activeBookings: [],
            inactiveBookings: [],
            bookings: [],
            searchBox: initialSearchText,
            filteredActiveBookings: [],
            filteredInactiveBookings: [],
            bookingIdBeingActioned: "",
            errorMessage: "",
            bookingToComplete: '',
            updatingPaymentMethod: false,
            bookingToVerifyBankAccount: '',
            agreementAccepted: false,
            payWithAch: false,
            microDepositVerify: false,
            reviewPaymentAmounts: false,
            collectMicroDepositVerifyPayment: false,
            bookingCompleteSuccess: false,
            bankAccountVerifySuccess: false,
            completeBookingErrorMessage: '',
            microDepositVerifyBankAccountHolderName: '',
            microDepositVerifyBankAccountHolderType: '',
            microDepositVerifyBankRoutingNumber: '',
            microDepositVerifyBankAccountNumber: '',
            microDepositVerifyBankAccountNumber2: '',
            microDepositAmount1: '',
            microDepositAmount2: '',
            initialBookingChargeAmount: 0,
            initialBookingPaymentProcessingFee: 0,
            initialBookingPaymentAmount: 0,
            totalNumberOfPayments: 0,
            recurringBookingChargeAmount: 0,
            recurringBookingPaymentProcessingFee: 0,
            recurringBookingPaymentAmount: 0,
            firstRecurringPaymentDate: '',
            lastRecurringPaymentDate: '',
            bookingDuration: 0,
            selectedPaymentMethod: '',
            paymentMethods: [],
            showCancelConfirmation: false,
            showCancelSubscriptionConfirmation: false,
            showUpdatePaymentMethodModal: false
        };

        this.searchKeys = [
            "orderNumber",
            "startDate",
            "endDate",
            "supplierCompanyName",
            "location.locationName",
            "status",
            "frequency",
            "durationType",
            "rateSearchText",
            "initialChargeSearchText",
            "recurringChargeSearchText",
            "brokeredBuyerChargedPerOccurrenceSearchText",
            "brokeredBuyerOverageRateChargedSearchText"
        ];

        this.labels = [
            {"label": "Booking number", "field": "orderNumber", "rows": 1},
            {"label": "Partner", "field": "supplierCompanyName", "rows": 1},
            {
                "label": "Frequency",
                "field": "",
                "valueF": function (booking) {
                    return (booking.frequency === 'RECURRING' && booking.durationType === 'WEEKLY' ?
                        'Recurring - Weekly'
                        :
                        booking.frequency === 'RECURRING' && booking.durationType === 'MONTHLY' ?
                            'Recurring - Monthly'
                            :
                            'One-Time');
                },
                "rows": 1
            },
            {"label": "EQUIPMENT TYPE", "field": "assetType", "rows": 1},
            {"label": "booked dates", "field": "startDate", "field2": "endDate", "rows": 1},
            {"label": "Spaces booked", "field": "numberOfSpaces", "rows": 1},
            {"label": "location", "field": "locationName", "rows": 1},
            {
                "label": function (booking) {
                    return booking.brokered ? '' : 'Rate';
                },
                "field": "",
                "valueF": function (booking) {
                    return booking.brokered ? '' :
                        formatCurrencyValue(booking.rate) +
                        (booking.durationType === 'WEEKLY' ? ' /week' : booking.durationType === 'MONTHLY' ? ' /month' : ' /day')

                },
                "rows": 1
            },
            {"label": "payment schedule", "field": "paymentSchedule", "rows": 1},
            {
                "label": function (booking) {
                    return booking.frequency === 'RECURRING' ? 'Initial Charge' : 'Total Cost';
                },
                "field": "",
                "valueF": function (booking) {
                    return formatCurrencyValue(booking.initialCharge);

                },
                "rows": 1
            },

            {
                "label": function (booking) {
                    return (booking.frequency === 'RECURRING' ? BookedSpaces.getOccurrenceLabel(booking) + ' Charge' : '');
                },
                "field": "",
                "valueF": function (booking) {
                    return booking.frequency === 'RECURRING' ?
                        formatCurrencyValue(booking.recurringCharge) : '';
                },
                "rows": 1
            },
            {"label": "Payment Method", "field": "paymentMethodDescription", "rows": 1},
            {"label": "Status", "field": "status", "class": "getStatusClass", "rows": 1},
            {"label": "Created On", "field": "createdOn", "rows": 1},
            {"label": "Address", "rows": 1},
            {"label": "Facility Instructions", "rows": 2}
        ];
    }


    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.account !== nextProps.account) {
            if (nextProps.account && nextProps.account.id) {
                this.loadStripe(this.createHandleStripeLoad(nextProps.account));
                this.loadStripeCheckout(this.createHandleStripeCheckoutLoad(nextProps.account));
                this.loadPlaid(this.createHandlePlaidLoad(nextProps.account));
            }
            this.reloadBookedSpaces(nextProps.account ? nextProps.account.id : null);
            this.loadPaymentMethods(nextProps.account ? nextProps.account.id : null);
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleWindowResize);
        if (this.props.account && this.props.account.id) {
            this.loadStripe(this.createHandleStripeLoad(this.props.account));
            this.loadStripeCheckout(this.createHandleStripeCheckoutLoad(this.props.account));
            this.loadPlaid(this.createHandlePlaidLoad(this.props.account));
        }
        this.reloadBookedSpaces(this.props.account ? this.props.account.id : null);
        this.loadPaymentMethods(this.props.account ? this.props.account.id : null);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowResize);
        if (this.stripeHandler) {
            this.stripeHandler.close();
        }
        if (this.plaidHandler) {
            this.plaidHandler.exit();
        }
    }

    handleWindowResize = () => {
        this.forceUpdate();
    };

    loadPaymentMethods = accountId => {
        if (accountId) {
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
    };

    paymentMethodsLoaded = (data) => {
        this.setState({paymentMethods: data});
    };

    paymentMethodsFailedToLoad = (jqXHR, textStatus, errorThrown) => {
        this.setState({
            paymentMethods: [],
            errorMessage: "Failed to load payment methods."
        });
    };

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

    createHandleStripeCheckoutLoad = account => {
        let _this = this;
        return function () {
            _this.handleStripeCheckoutLoad(account)
        }
    };

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
            name: "Complete Booking",
            color: 'black',
            email: account.email,
            token: (token) => {
                Busy.set(true);
                $.ajax({
                    url: 'api/booking/complete-booking',
                    data: JSON.stringify({
                        id: this.state.bookingToComplete.id,
                        buyerAccountId: this.props.account.id,
                        stripeToken: token.id,
                        tosDocUrl: this.getAgreementUrl(),
                        paymentType: this.state.payWithAch || this.state.brokeredBooking ? "ACH" : "CARD"
                    }),
                    type: 'POST',
                    contentType: 'application/json; charset=UTF-8',
                    dataType: "json",
                    success: this.handleUpdateBookingSuccess,
                    statusCode: {
                        401: createLogoutOnFailureHandler(this.props.handleLogout)
                    },
                    error: this.handleCompleteBookingFailure
                });
            }
        });

        this.setState({
            stripeLoading: false,
            // loading needs to be explicitly set false so component will render in 'loaded' state.
            loading: false,
        });
    };

    createHandlePlaidLoad = account => {
        let _this = this;
        return function () {
            _this.handlePlaidLoad(account);
        }
    };

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
                    url: 'api/booking/complete-booking',
                    data: JSON.stringify({
                        id: this.state.bookingToComplete.id,
                        buyerAccountId: this.props.account.id,
                        plaidPublicToken: public_token,
                        plaidAccountId: metadata.account_id,
                        tosDocUrl: this.getAgreementUrl(),
                        paymentType: this.state.payWithAch || this.state.brokeredBooking ? "ACH" : "CARD"
                    }),
                    type: 'POST',
                    contentType: 'application/json; charset=UTF-8',
                    dataType: "json",
                    success: this.handleUpdateBookingSuccess,
                    error: this.handleCompleteBookingFailure
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

    bookingsLoaded = data => {

        const activeBookings = []
        const inactiveBookings = []

        if (data) {
            //Sort by most recent on top
            data = data.sort(function (a, b) {
                let aOrderNumber = a.orderNumber;
                let bOrderNumber = b.orderNumber;
                if (bOrderNumber < aOrderNumber) {
                    return -1;
                }
                if (aOrderNumber < bOrderNumber) {
                    return 1;
                }
                return 0;
            });
        }
        for (let i = 0; i < data.length; i++) {
            let booking = data[i];
            //Add the search fields that have additional format before the searchText is generated for this booking
            booking.rateSearchText = booking.rate ? formatCurrencyValue(booking.rate) : "";
            booking.initialChargeSearchText = booking.initialCharge ? formatCurrencyValue(booking.initialCharge) : "";
            booking.recurringChargeSearchText = booking.recurringCharge ? formatCurrencyValue(booking.recurringCharge) : "";
            booking.brokeredBuyerChargedPerOccurrenceSearchText = booking.brokeredBuyerChargedPerOccurrence ? formatCurrencyValue(booking.brokeredBuyerChargedPerOccurrence) : "";
            booking.brokeredBuyerOverageRateChargedSearchText = booking.brokeredBuyerOverageRateCharged ? formatCurrencyValue(booking.brokeredBuyerOverageRateCharged) : "";

            booking.searchText = this.searchKeys.map(key => {
                let dotIndex = key.indexOf('.');

                if (dotIndex < 0) {
                    return booking[key];
                } else {
                    let keyParts = key.split(".");
                    let childRecord = booking[keyParts[0]];
                    return childRecord ? childRecord[keyParts[1]] : '';
                }
            }).join("").toLocaleLowerCase();

            if(booking.active) {
                activeBookings.push(booking)
            } else {
                inactiveBookings.push(booking)
            }
        }

        Busy.set(false);
        this.setState({
            bookings: data,
            activeBookings,
            inactiveBookings,
            filteredActiveBookings: activeBookings,
            filteredInactiveBookings: inactiveBookings
        }, () => {
            this.search(this.state.searchBox);
        });
    };

    bookingsFailedToLoad = (jqXHR, textStatus, errorThrown) => {
        Busy.set(false);
        this.setState({errorMessage: "Failed to load bookings."});
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

    reloadBookedSpaces = accountId => {
        if (accountId) {
            Busy.set(true);
            $.ajax({
                url: 'api/booking/all-buyer-bookings/' + accountId,
                type: 'GET',
                success: this.bookingsLoaded,
                statusCode: {
                    401: createLogoutOnFailureHandler(this.props.handleLogout)
                },
                error: this.bookingsFailedToLoad
            });
        }
    };

    cancelBookingModal = () => {
        Busy.set(false);
        this.setState({
            showCancelConfirmation: false,
            bookingIdBeingActioned: null
        });
    };

    cancelBooking = bookingId => {
        this.setState({showCancelConfirmation: true});
        this.setState({bookingIdBeingActioned: bookingId});
    };

    cancelBookingAction = () => {
        Busy.set(true);
        $.ajax({
            url: 'api/booking/cancel',
            data: JSON.stringify({
                id: this.state.bookingIdBeingActioned
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: this.handleCancelBookingSuccess,
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: this.handleFailure
        });
    };

    handleCancelBookingSuccess = updatedBooking => {
        this.handleSuccess(updatedBooking, "Successfully cancelled booking " + updatedBooking.orderNumber);
    };

    hideCancelSubscriptionModal = () => {
        Busy.set(false);
        this.setState({
            showCancelSubscriptionConfirmation: false,
            bookingIdBeingActioned: null
        });
    };

    showCancelSubscriptionModal = bookingId => {
        this.setState({
            showCancelSubscriptionConfirmation: true,
            bookingIdBeingActioned: bookingId
        });
    };

    cancelSubscriptionAction = () => {
        Busy.set(true);
        $.ajax({
            url: 'api/booking/cancel-subscription',
            data: JSON.stringify({
                id: this.state.bookingIdBeingActioned
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: this.handleCancelSubscriptionSuccess,
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: this.handleFailure
        });
    };

    handleCancelSubscriptionSuccess = updatedBooking => {
        this.handleSuccess(updatedBooking, "Subscription for booking " + updatedBooking.orderNumber + " will end on " + updatedBooking.endDate);
    };

    handleSuccess(updatedBooking, message) {
        Busy.set(false);
        toast.success(message);
        this.setState({
            bookingIdBeingActioned: "",
            errorMessage: ""
        });
        this.reloadBookedSpaces(this.props.account ? this.props.account.id : null);
    }

    handleFailure = (jqXHR, textStatus, errorThrown) => {
        Busy.set(false);
        let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "Internal Server Error";
        errorMessage = errorMessage ? errorMessage.trim() : errorMessage;
        this.setState({errorMessage: errorMessage});
    };

    verifyBankAccount = () => {
        Busy.set(true);
        $.ajax({
            url: 'api/booking/verify-bank-account',
            data: JSON.stringify({
                bookingId: this.state.bookingToVerifyBankAccount.id,
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

    handleBankAccountVerifySuccess = (updatedBooking) => {
        Busy.set(false);
        this.setState((prevState) => ({
            bookings: prevState.bookings.map(booking => {
                return booking.id === updatedBooking.id ? updatedBooking : booking;
            }),
            bankAccountVerifySuccess: true,
            bankAccountVerifyErrorMessage: ''
        }));
        this.reloadBookedSpaces(this.props.account.id);
    };

    handleVerifyBankAccountFailure = (jqXHR, textStatus, errorThrown) => {
        let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "";
        Busy.set(false);
        this.setState({
            bookingCompleteSuccess: false,
            bankAccountVerifyErrorMessage: errorMessage
        });
    };

    showCancel(booking) {
        const ONE_HOUR = 60 * 60 * 1000;
        const TWENTY_FOUR_HOURS = 24 * ONE_HOUR;
        let timeBeforeBookingStart = new Date(booking.startDate) - (new Date());

        return booking.status === 'Pending' || ((booking.status === 'Approved' || booking.status === 'Processing-ACH-Payment') && booking.frequency !== 'RECURRING' && timeBeforeBookingStart > TWENTY_FOUR_HOURS);
    }

    searchChangeHandler = event => {
        this.search(event.target.value);
    };

    search(filterText) {
        let activeResults
        let inactiveResults
        if (filterText) {
            let filterTokens = filterText.split(" ").map(value => value.toLocaleLowerCase());

            activeResults = this.state.activeBookings.filter(booking => {
                for (let token of filterTokens) {
                    if (!booking.searchText.includes(token)) {
                        return false;
                    }
                }
                return true;
            });

            inactiveResults = this.state.inactiveBookings.filter(booking => {
                for (let token of filterTokens) {
                    if (!booking.searchText.includes(token)) {
                        return false;
                    }
                }
                return true;
            });
        } else {
            activeResults = this.state.activeBookings
            inactiveResults = this.state.inactiveBookings
        }

        this.setState({
            searchBox: filterText,
            filteredActiveBookings: activeResults,
            filteredInactiveBookings: inactiveResults
        });
    }

    static getOccurrenceLabel(booking) {
        return booking.frequency === 'RECURRING' && booking.durationType === 'WEEKLY' ?
            'Weekly'
            :
            booking.frequency === 'RECURRING' && booking.durationType === 'MONTHLY' ?
                'Monthly'
                :
                'Daily';
    }

    completeBooking = (booking, updatingPaymentMethod) => {
        this.calculateCreditCardFees(booking);
        this.setState({
            bookingToComplete: booking,
            updatingPaymentMethod: updatingPaymentMethod
        });
    };

    calculateCreditCardFees = booking => {
        this.setState({
            initialBookingPaymentAmount: booking.initialPaymentAmount,
            initialBookingPaymentProcessingFee: "Calculating....",
            initialBookingChargeAmount: "Calculating....",
            totalNumberOfPayments: booking.totalNumberOfPayments,
            recurringBookingPaymentAmount: booking.recurringPaymentAmount,
            recurringBookingPaymentProcessingFee: "Calculating....",
            recurringBookingChargeAmount: "Calculating....",
            firstRecurringPaymentDate: booking.firstRecurringPaymentDate,
            lastRecurringPaymentDate: booking.lastRecurringPaymentDate
        });
        $.ajax({
            url: 'api/booking/calculate-booking-charge-amount',
            data: JSON.stringify({
                id: booking.id,
                supplierAccountId: booking.supplierAccountId,
                buyerAccountId: booking.buyerAccountId,
                locationId: booking.locationId,
                numberOfSpaces: booking.numberOfSpaces,
                startDate: booking.startDate,
                endDate: booking.endDate,
                frequency: booking.frequency,
                recurrences: booking.recurrences,
                durationType: booking.durationType,
                rate: booking.rate,
                assetType: booking.assetType,
                brokeredBooking: booking.brokered,
                brokeredInitialChargeAlreadyPaid: booking.brokeredInitialChargeAlreadyPaid,
                brokeredRecurringChargeAlreadyPaid: booking.brokeredRecurringChargeAlreadyPaid,
                brokeredSupplierPaidPerOccurrence: booking.brokeredSupplierPaidPerOccurrence,
                brokeredBuyerChargedPerOccurrence: booking.brokeredBuyerChargedPerOccurrence,
                brokeredSupplierOverageRatePaid: booking.brokeredSupplierOverageRatePaid,
                brokeredBuyerOverageRateCharged: booking.brokeredBuyerOverageRateCharged,
                paymentMethodId: this.state.selectedPaymentMethod ? this.state.selectedPaymentMethod.id : ''
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: this.handleRecalculateChargeSuccess,
            error: this.handleRecalculateChargeFailure
        });
    };

    handleRecalculateChargeSuccess = data => {
        this.setState({
            errorMessage: '',
            initialBookingPaymentProcessingFee: this.state.selectedPaymentMethod && this.state.selectedPaymentMethod.type === 'ACH' ? 0 : data.initialBookingPaymentProcessingFee,
            initialBookingChargeAmount: data.initialBookingChargeAmount,
            recurringBookingPaymentProcessingFee: this.state.selectedPaymentMethod && this.state.selectedPaymentMethod.type === 'ACH' ? 0 : data.recurringBookingPaymentProcessingFee,
            recurringBookingChargeAmount: data.recurringBookingChargeAmount
        })
    };

    handleRecalculateChargeFailure = (jqXHR, textStatus, errorThrown) => {
        let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message ? jqXHR.responseJSON.message.trim() : "" : "";

        toast.error(errorMessage);
        this.setState({
            errorMessage: '',
            initialBookingPaymentProcessingFee: 0,
            initialBookingChargeAmount: 0,
            recurringBookingPaymentProcessingFee: 0,
            recurringBookingChargeAmount: 0
        });
    };

    showPaymentReview = (e) => {
        e.preventDefault();
        if (!this.state.agreementAccepted) {
            this.setState({completeBookingErrorMessage: "Please accept the agreement."});
        } else {
            this.setState({
                completeBookingErrorMessage: '',
                reviewPaymentAmounts: true,
                collectMicroDepositVerifyPayment: '',
                bookingCompleteSuccess: false
            })
        }
    };

    collectPaymentInfo = (e) => {
        e.preventDefault();

        if (!this.state.selectedPaymentMethod) {
            this.setState({errorMessage: "Please select a payment method."})
        } else {
            Busy.set(true);
            $.ajax({
                url: 'api/booking/complete-booking',
                data: JSON.stringify({
                    id: this.state.bookingToComplete.id,
                    buyerAccountId: this.props.account.id,
                    tosDocUrl: this.getAgreementUrl(),
                    paymentMethodId: this.state.selectedPaymentMethod ? this.state.selectedPaymentMethod.id : ''
                }),
                type: 'POST',
                contentType: 'application/json; charset=UTF-8',
                dataType: "json",
                success: this.handleUpdateBookingSuccess,
                statusCode: {
                    401: createLogoutOnFailureHandler(this.props.handleLogout)
                },
                error: this.handleCompleteBookingFailure
            });
        }
    };

    completeZeroDollarBooking = (e) => {
        e.preventDefault();
        Busy.set(true);
        $.ajax({
            url: 'api/booking/complete-booking',
            data: JSON.stringify({
                id: this.state.bookingToComplete.id,
                buyerAccountId: this.props.account.id,
                tosDocUrl: this.getAgreementUrl()
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: this.handleUpdateBookingSuccess,
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: this.handleCompleteBookingFailure
        });
    };

    completeBookingWithMicroDepositVerificationPayment = e => {
        e.preventDefault();
        let _this = this;
        let accountHolderType = this.state.microDepositVerifyBankAccountHolderType === "Individual" ? "individual" : "company";

        if (this.state.microDepositVerifyBankAccountNumber !== this.state.microDepositVerifyBankAccountNumber2) {
            this.setState({addPaymentMethodErrorMessage: "Re-entered bank account number does not match"});
            return;
        }

        Busy.set(true);
        this.stripe.createToken('bank_account', {
            country: 'US',
            currency: 'usd',
            routing_number: this.state.microDepositVerifyBankRoutingNumber,
            account_number: this.state.microDepositVerifyBankAccountNumber,
            account_holder_name: this.state.microDepositVerifyBankAccountHolderName,
            account_holder_type: accountHolderType,
        }).then(function (result) {
            let error = result.error;
            if (error) {
                let errorMessage = error.message;
                Busy.set(false);
                _this.setState({
                    bookingCompleteSuccess: "",
                    completeBookingErrorMessage: errorMessage
                });
            } else {
                let token = result.token;
                $.ajax({
                    url: 'api/booking/complete-booking',
                    data: JSON.stringify({
                        id: _this.state.bookingToComplete.id,
                        buyerAccountId: _this.props.account.id,
                        stripeToken: token.id,
                        tosDocUrl: _this.getAgreementUrl(),
                        paymentType: _this.state.payWithAch || _this.state.brokeredBooking ? "ACH" : "CARD"
                    }),
                    type: 'POST',
                    contentType: 'application/json; charset=UTF-8',
                    dataType: "json",
                    success: _this.handleUpdateBookingSuccess,
                    statusCode: {
                        401: createLogoutOnFailureHandler(_this.props.handleLogout)
                    },
                    error: _this.handleCompleteBookingFailure
                });
            }
        });
    };

    handleUpdateBookingSuccess = (updatedBooking) => {
        Busy.set(false);
        this.setState((prevState) => ({
            bookings: prevState.bookings.map(booking => {
                return booking.id === updatedBooking.id ? updatedBooking : booking;
            }),
            bookingCompleteSuccess: true,
            completeBookingErrorMessage: ''
        }));
        this.reloadBookedSpaces(this.props.account.id);
    };

    handleCompleteBookingFailure = (jqXHR, textStatus, errorThrown) => {
        let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "";
        if (errorMessage && "Your card was declined." === errorMessage.trim()) {
            errorMessage = "This card was declined by your bank.  Please call your bank to increase your daily limit or try a different card.";
        } else if (errorMessage && "The Booking charge amount exceeds the available balance in this bank account." === errorMessage.trim()) {
            errorMessage = "The charge amount exceeds the available balance in this bank account.";
        } else {
            errorMessage = "An error occurred while completing this booking.";
        }
        Busy.set(false);
        this.setState({
            bookingCompleteSuccess: false,
            completeBookingErrorMessage: errorMessage
        });
    };

    getAgreementUrl = () => {
        return this.state.bookingToComplete && this.state.bookingToComplete.supplierLegalAgreementFileName ?
            'https://s3-us-west-1.amazonaws.com/securspace-files/legal-agreements/' + this.state.bookingToComplete.supplierLegalAgreementFileName
            :
            'https://s3-us-west-1.amazonaws.com/securspace-files/app-files/RESERVATION+AGREEMENT.pdf';
    };

    toggleMicroDepositVerify = () => {
        this.setState({microDepositVerify: !this.state.microDepositVerify});
    };

    selectInstantVerifyClassName = () => {
        return "ss-button-primary-left" + (!this.state.microDepositVerify ? " ss-button-primary-selected" : " ss-button-primary-deselected");
    };

    selectMicroDepositVerifyClassName = () => {
        return "ss-button-primary-right" + (this.state.microDepositVerify ? " ss-button-primary-selected" : " ss-button-primary-deselected");
    };

    preventFormSubmitOnEnter = event => {

        if (event.which === 13) {
            event.preventDefault();
        }
    };

    handlePaymentMethodChange = event => {
        let value = event.target.checked;
        let paymentMethodId = event.target.id;

        if (value) {
            let selectedPaymentMethod = this.state.paymentMethods.find(function (paymentMethod) {
                return paymentMethod.id === paymentMethodId;
            });
            this.setState({
                selectedPaymentMethod: selectedPaymentMethod
            }, () => {
                this.calculateCreditCardFees(this.state.bookingToComplete);
            });
        }
    };

    resetButton = type => {
        if (type === 'reviewPayment') {
            this.setState({
                reviewPaymentAmounts: '',
                collectMicroDepositVerifyPayment: '',
                bookingCompleteSuccess: '',
                completeBookingErrorMessage: ''
            });
        } else {
            this.setState({
                bookingToComplete: '',
                updatingPaymentMethod: '',
                reviewPaymentAmounts: '',
                collectMicroDepositVerifyPayment: '',
                bookingCompleteSuccess: '',
                completeBookingErrorMessage: '',
                microDepositVerifyBankAccountHolderName: '',
                microDepositVerifyBankAccountHolderType: '',
                microDepositVerifyBankRoutingNumber: '',
                microDepositVerifyBankAccountNumber: '',
                microDepositVerifyBankAccountNumber2: '',
                microDepositAmount1: '',
                microDepositAmount2: ''
            });
        }

    };

    isZeroDollarBooking = (booking) => {
        return booking.brokered &&
            booking.brokeredInitialChargeAlreadyPaid &&
            booking.brokeredRecurringChargeAlreadyPaid &&
            booking.brokeredSupplierPaidPerOccurrence === 0 &&
            booking.brokeredBuyerChargedPerOccurrence === 0 &&
            booking.brokeredSupplierOverageRatePaid === 0 &&
            booking.brokeredBuyerOverageRateCharged === 0;
    };

    generateAddPaymentMethodLink = () => {
        let content = <Link to={{
            pathname: '/company-profile',
            search: '?managePaymentMethods=true&returnTo=my-bookings'
        }}>Add Payment Method</Link>


        if (this.props.navigateToPaymentMethods) {
            content = <div className="add-payment-method-link" onClick={this.props.navigateToPaymentMethods}>Add Payment
                Method</div>
        }

        return content
    }


    showCancelSubscription = (booking) => {
        return booking.bookingSubscriptionStatus === 'ACTIVE' &&
            (booking.status === 'Approved' ||
            booking.status === 'Active' ||
            booking.status === 'Payment Declined' ||
            booking.status === 'Payment Declined-Adjusted' ||
            booking.status === 'Processing-ACH-Payment');
    }

    updatePaymentMethodForBooking = (booking, showModal) => {
        this.setState({
            showUpdatePaymentMethodModal: showModal,
            updatePaymentMethodBooking: booking
        })
    }

    setShowUpdatePaymentMethodModal = (show: boolean) : void => {
        this.setState({ showUpdatePaymentMethodModal: show })
    }

    onUpdatePaymentMethodSuccess = () => {
        this.reloadBookedSpaces(this.props.account ? this.props.account.id : null);
    }

    render() {
        let fullApp = URLUtils.getPath() !== '/truck-parking';
        return (
            <div className="grey-bg hs-bookings-container">
                <div>
                    {
                        fullApp ?
                            <header>
                                <ul className="breadcrumb">
                                    <li>Bookings</li>
                                    <li>My Bookings</li>
                                </ul>
                                <h1 className="content-header-title">My Bookings</h1>
                            </header>
                            :
                            ''
                    }

                    <div style={!fullApp ? {marginTop: "30px"} : {}}>
                        <div className='search-container'>
                            <form
                                onKeyPress={this.preventFormSubmitOnEnter}>
                                <div>
                                    <div className="trigger-click hs-field">
                                        <label>SEARCH</label>
                                        <input type="text"
                                               id="searchBox"
                                               name="searchBox"
                                               value={this.state.searchBox}
                                               onChange={this.searchChangeHandler}
                                               placeholder="Type to filter results"
                                        />
                                        <i className="fa fa-search"></i>
                                    </div>
                                </div>
                            </form>
                        </div>
                        {
                            this.state.errorMessage && !this.state.bookingIdBeingActioned ?
                                <div>
                                    <ErrorAlert>{this.state.errorMessage}</ErrorAlert>
                                </div>
                                :
                                ''
                        }

                        <div>
                            <div className="active-bookings-header">Active Bookings</div>
                            <div>
                                {
                                    this.state.filteredActiveBookings && this.state.filteredActiveBookings.length === 0 ?
                                        <div className="ss-supplier-active-bookings-endlist">
                                            <h4>No bookings match your search</h4>
                                        </div>
                                        :
                                    this.state.filteredActiveBookings.map((booking, index) =>
                                        <div className="ss-booking-container" key={index}>

                                            <BookingListItem
                                                account={this.props.account}
                                                labels={this.labels}
                                                booking={booking}
                                                key={booking.id + '-' + booking.status}
                                            >
                                                {
                                                    this.state.errorMessage && this.state.bookingIdBeingActioned === booking.id ?
                                                        <div className="alert alert-danger"><span
                                                            className="lead">{this.state.errorMessage}</span></div>
                                                        :
                                                        ''
                                                }
                                                {
                                                    this.showCancel(booking) ?

                                                        <button className="ss-button-danger" onClick={() => this.cancelBooking(booking.id)}>
                                                            {booking.status === 'Pending' ? 'Cancel Booking Request' : 'Cancel Booking'}
                                                        </button>

                                                        :
                                                        ''
                                                }
                                                {
                                                    booking.status === 'Incomplete' ?
                                                        <button type="button" className="ss-button-primary"
                                                                onClick={() => this.completeBooking(booking, false)}>
                                                            Complete Booking
                                                        </button>
                                                        :
                                                        (fullApp && booking.status === 'Approved') || booking.status === 'Active' || booking.status === 'Payment Declined' || booking.status === 'Payment Declined-Adjusted' ?
                                                            <button type="button"
                                                                    className="ss-button-primary"
                                                                    onClick={() => this.updatePaymentMethodForBooking(booking, true)}>
                                                                Update Payment Method
                                                            </button>
                                                            :
                                                            booking.status === 'Pending-Verification Required' ?
                                                                <button type="button" className="ss-button-primary"
                                                                        onClick={() => this.setState({bookingToVerifyBankAccount: booking})}>
                                                                    Verify Bank Account
                                                                </button>
                                                                :
                                                                ''
                                                }
                                                {
                                                    this.showCancelSubscription(booking) ?
                                                        <button type="button" className="ss-button-danger" onClick={() => this.showCancelSubscriptionModal(booking.id)}>
                                                            End Monthly Booking
                                                        </button>
                                                        :
                                                        ''
                                                }
                                            </BookingListItem>
                                        </div>
                                    )
                                }
                            </div>
                        </div>

                        <div>
                            <div className="inactive-bookings-header">Inactive Bookings</div>
                            <div>
                                {
                                    this.state.filteredInactiveBookings && this.state.filteredInactiveBookings.length === 0 ?
                                        <div className="ss-supplier-active-bookings-endlist">
                                            <h4>No bookings match your search</h4>
                                        </div>
                                        :
                                    this.state.filteredInactiveBookings.map((booking, index) =>
                                        <div className="ss-booking-container" key={index}>

                                            <BookingListItem
                                                account={this.props.account}
                                                labels={this.labels}
                                                booking={booking}
                                                key={booking.id + '-' + booking.status}
                                            >
                                                {
                                                    this.state.errorMessage && this.state.bookingIdBeingActioned === booking.id ?
                                                        <div className="alert alert-danger"><span
                                                            className="lead">{this.state.errorMessage}</span></div>
                                                        :
                                                        ''
                                                }
                                                {
                                                    this.showCancel(booking) ?

                                                        <button className="ss-button-danger" onClick={() => this.cancelBooking(booking.id)}>
                                                            {booking.status === 'Pending' ? 'Cancel Booking Request' : 'Cancel Booking'}
                                                        </button>

                                                        :
                                                        ''
                                                }
                                                {
                                                    booking.status === 'Incomplete' ?
                                                        <button type="button" className="ss-button-primary"
                                                                onClick={() => this.completeBooking(booking, false)}>
                                                            Complete Booking
                                                        </button>
                                                        :
                                                        (fullApp && booking.status === 'Approved') || booking.status === 'Active' || booking.status === 'Payment Declined' || booking.status === 'Payment Declined-Adjusted' ?
                                                            <button type="button"
                                                                    className="ss-button-primary"
                                                                    onClick={() => this.updatePaymentMethodForBooking(booking, true)}>
                                                                Update Payment Method
                                                            </button>
                                                            :
                                                            booking.status === 'Pending-Verification Required' ?
                                                                <button type="button" className="ss-button-primary"
                                                                        onClick={() => this.setState({bookingToVerifyBankAccount: booking})}>
                                                                    Verify Bank Account
                                                                </button>
                                                                :
                                                                ''
                                                }
                                                {
                                                    this.showCancelSubscription(booking) ?
                                                        <button type="button" className="ss-button-danger" onClick={() => this.showCancelSubscriptionModal(booking.id)}>
                                                            End Monthly Booking
                                                        </button>
                                                        :
                                                        ''
                                                }
                                            </BookingListItem>
                                        </div>
                                    )
                                }
                            </div>
                        </div>

                    </div>
                    <hr />
                    <div className='ss-supplier-active-bookings-endlist'>
                        <h6>You have reached the end of the list</h6>
                    </div>
                </div>

                <ConfirmDialog showAlert={this.state.showCancelConfirmation}
                               title="Cancel Booking"
                               onClose={this.cancelBookingModal}
                               proceedEventHandler={this.cancelBookingAction}>
                    Are you sure you want to cancel this booking?
                </ConfirmDialog>
                <ConfirmDialog showAlert={this.state.showCancelSubscriptionConfirmation}
                               title="End Monthly Booking"
                               onClose={this.hideCancelSubscriptionModal}
                               proceedEventHandler={this.cancelSubscriptionAction}>
                    Are you sure you want to end this monthly booking?
                </ConfirmDialog>

                {
                    this.state.bookingToVerifyBankAccount ?
                        <div className="unselectable">
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="popup-header">
                                        <h1>Verify Bank Account</h1>
                                        <button type="button" className="close pull-right"
                                                aria-label="Close"
                                                onClick={() => this.setState({
                                                    bookingToVerifyBankAccount: '',
                                                    bankAccountVerifySuccess: '',
                                                    bankAccountVerifyErrorMessage: ''
                                                })}>
                                            <img alt="" src="../app-images/close.png"/>
                                        </button>
                                    </div>

                                    <form className="ss-book-space-form ss-form ss-block">
                                        {
                                            this.state.bankAccountVerifySuccess ?
                                                <div>
                                                    <div className="modal-body">
                                                        <h3>BANK ACCOUNT VERIFIED SUCCESSFULLY</h3>
                                                        <br/>
                                                        <ul>
                                                            {
                                                                this.state.bookingToComplete.brokeredInitialChargeAlreadyPaid ?
                                                                    <li><p>This Booking is now fully approved.</p></li>
                                                                    :
                                                                    <li><p>
                                                                        This Booking is now fully approved and your
                                                                        payment is processing.
                                                                    </p></li>
                                                            }
                                                            <li><p>
                                                                You may now begin using this Booking to store equipment.
                                                            </p></li>
                                                        </ul>
                                                    </div>

                                                    <div className="modal-footer">
                                                        <div className="table text-center">
                                                            <button type="button"
                                                                    onClick={this.resetButton}
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
                                                            &nbsp;&bull;&nbsp;&nbsp; Two deposits were made into your
                                                            bank
                                                            account
                                                            <br/>
                                                            &nbsp;&bull;&nbsp;&nbsp; Statement description for these
                                                            deposits
                                                            is: AMNTS: 2 deposit amounts
                                                            <br/>
                                                            &nbsp;&bull;&nbsp;&nbsp; Deposit amounts are less than $1
                                                            <br/>
                                                            &nbsp;&bull;&nbsp;&nbsp; Deposits take 1-2 days to appear
                                                        </p>
                                                        <br/>
                                                        <fieldset className="ss-stand-alone">
                                                            <label htmlFor="microDepositAmount1">FIRST DEPOSIT
                                                                AMOUNT</label>
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
                                                            <label htmlFor="microDepositAmount2">SECOND DEPOSIT
                                                                AMOUNT</label>
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
                                                                    className="ss-button-primary">Verify Bank Account
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
                        ''
                }
                {
                    this.state.bookingToComplete ?
                        <div className="unselectable">
                            <div className="modal-dialog">
                                <div className="modal-content ">
                                    <div className="popup-header">
                                        <h1>{this.state.updatingPaymentMethod ? "Update Payment Method" : "Complete Booking"}</h1>
                                        <button type="button" className="close pull-right"
                                                aria-label="Close"
                                                onClick={this.resetButton}>
                                            <img alt="" src="../app-images/close.png"/>
                                        </button>
                                    </div>
                                    <form className="ss-book-space-form ss-form ss-block no-padding">

                                        {
                                            this.state.bookingCompleteSuccess ?
                                                <div>
                                                    <div className="modal-body">

                                                        {
                                                            this.state.updatingPaymentMethod ?
                                                                <h3>PAYMENT METHOD UPDATED SUCCESSFULLY</h3>
                                                                :
                                                                <h3>BOOKING COMPLETED SUCCESSFULLY</h3>
                                                        }
                                                        <br/>
                                                        <ul className="payment-update-success-description-list">
                                                            {
                                                                this.state.updatingPaymentMethod ?
                                                                    <li><p>The payment method for this Booking has
                                                                        been
                                                                        updated.</p></li>
                                                                    :
                                                                    this.state.bookingToComplete.brokeredInitialChargeAlreadyPaid ?
                                                                        <li><p>This Booking is now fully
                                                                            approved.</p></li>
                                                                        :
                                                                        <li><p>This Booking is now fully approved
                                                                            and your
                                                                            payment is processing.</p></li>
                                                            }
                                                            <li><p>You may now use this Booking to store
                                                                equipment.</p></li>
                                                        </ul>
                                                    </div>
                                                    <div className="modal-footer">
                                                        <div className="table text-center">
                                                            <button type="button"
                                                                    onClick={this.resetButton}
                                                                    className="ss-button-primary">Done
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                :
                                                this.state.reviewPaymentAmounts ?
                                                    <ReviewPaymentAmounts
                                                        resetButton={this.resetButton}
                                                        collectPaymentInfo={this.collectPaymentInfo}
                                                        state={this.state}/>
                                                    :
                                                    this.isZeroDollarBooking(this.state.bookingToComplete) ?
                                                        <div>
                                                            <div className="modal-body">
                                                                <h4 className="ss-summary">
                                                                    Accept Terms Of Service Agreement:
                                                                </h4>
                                                                <label className="ss-checkbox">
                                                                    <input type="checkbox"
                                                                           id="agreementAccepted"
                                                                           name="agreementAccepted"
                                                                           value={this.state.agreementAccepted}
                                                                           checked={this.state.agreementAccepted}
                                                                           onChange={this.handleChange}
                                                                           title="Please read and accept the agreement to book space."
                                                                    />
                                                                    <span>I accept the <a
                                                                        href={this.getAgreementUrl()}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"> rental agreement</a>.</span>
                                                                </label>
                                                                {
                                                                    this.state.completeBookingErrorMessage ?
                                                                        <Error>{this.state.completeBookingErrorMessage}</Error> : ''
                                                                }
                                                            </div>
                                                            <div className="modal-footer">
                                                                <div className="table text-center">
                                                                    <button type="button"
                                                                            onClick={this.completeZeroDollarBooking}
                                                                            className="ss-button-primary">Next
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        :
                                                        <div>
                                                            <div className="modal-body">
                                                                <div id="selectPaymentMethod">
                                                                    <h4 className="ss-summary">
                                                                        1. Select Payment Method
                                                                    </h4>

                                                                    <div id="paymentMethodOptions">
                                                                        {
                                                                            this.state.paymentMethods.map((paymentMethod, index) =>
                                                                                <div key={index}>
                                                                                    <input type="radio"
                                                                                           className="ss-book-space-radio-input"
                                                                                           id={paymentMethod.id}
                                                                                           name="paymentMethodOptions"
                                                                                           value={this.state.selectedPaymentMethod && this.state.selectedPaymentMethod.id === paymentMethod.id}
                                                                                           onChange={this.handlePaymentMethodChange}
                                                                                    />
                                                                                    <p className="ss-book-space-radio-label"
                                                                                       htmlFor={paymentMethod.id}>
                                                                                        <b>{paymentMethod.type === 'CARD' ? paymentMethod.cardBrand : paymentMethod.bankName}</b>
                                                                                        &nbsp;ending
                                                                                        in&nbsp;
                                                                                        <b>{paymentMethod.lastFour}</b>
                                                                                    </p>
                                                                                </div>
                                                                            )
                                                                        }
                                                                        {
                                                                            this.generateAddPaymentMethodLink()
                                                                        }
                                                                        {
                                                                            this.state.selectedPaymentMethod && this.state.selectedPaymentMethod.type === 'CARD' ?
                                                                                <p className="help-block">
                                                                                <span
                                                                                    className="glyphicon glyphicon-info-sign"
                                                                                    aria-hidden="true"/>
                                                                                    Additional credit card
                                                                                    processing fee
                                                                                    applies
                                                                                </p>
                                                                                :
                                                                                ''
                                                                        }
                                                                    </div>

                                                                    <hr/>
                                                                    {
                                                                        this.state.payWithAch ?
                                                                            <div>
                                                                                <h4 className="ss-summary">2.
                                                                                    Select
                                                                                    Bank Account Verify
                                                                                    Method</h4>
                                                                                <div>
                                                                                    <button type="button"
                                                                                            id="selectInstantVerify"
                                                                                            className={this.selectInstantVerifyClassName()}
                                                                                            onClick={this.toggleMicroDepositVerify}>
                                                                                        Instant
                                                                                    </button>
                                                                                    <button type="button"
                                                                                            id="selectMicroDepositVerify"
                                                                                            className={this.selectMicroDepositVerifyClassName()}
                                                                                            onClick={this.toggleMicroDepositVerify}>
                                                                                        Micro Deposit
                                                                                    </button>
                                                                                    <p className="ss-details">
                                                                                        <b>Instant</b>
                                                                                        <br/>
                                                                                        &nbsp;&bull;&nbsp;&nbsp;
                                                                                        Requires you to
                                                                                        enter your Online
                                                                                        Banking
                                                                                        credentials
                                                                                        <br/>
                                                                                        &nbsp;&bull;&nbsp;&nbsp; Not
                                                                                        supported
                                                                                        with some local
                                                                                        banks
                                                                                        <br/>
                                                                                        <b>Micro Deposit</b>
                                                                                        <br/>
                                                                                        &nbsp;&bull;&nbsp;&nbsp;
                                                                                        Requires you to
                                                                                        enter your bank
                                                                                        account info
                                                                                        <br/>
                                                                                        &nbsp;&bull;&nbsp;&nbsp;
                                                                                        Takes a
                                                                                        few
                                                                                        days to complete
                                                                                        <br/>
                                                                                        &nbsp;&bull;&nbsp;&nbsp;
                                                                                        Supported with
                                                                                        all banks
                                                                                    </p>
                                                                                </div>
                                                                                <hr/>
                                                                            </div>
                                                                            :
                                                                            ''
                                                                    }

                                                                    <h4 className="ss-summary">
                                                                        {this.state.payWithAch ? '3' : '2'}.
                                                                        Accept
                                                                        Terms Of
                                                                        Service Agreement:</h4>
                                                                    <label className="ss-checkbox">
                                                                        <input type="checkbox"
                                                                               id="agreementAccepted"
                                                                               name="agreementAccepted"
                                                                               value={this.state.agreementAccepted}
                                                                               checked={this.state.agreementAccepted}
                                                                               onChange={this.handleChange}
                                                                               title="Please read and accept the agreement to book space."
                                                                        />
                                                                        <span>I accept the <a
                                                                            href={this.getAgreementUrl()}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"> rental agreement</a>.</span>
                                                                    </label>

                                                                    {
                                                                        this.state.completeBookingErrorMessage ?
                                                                            <Error>{this.state.completeBookingErrorMessage}</Error> : ''
                                                                    }

                                                                </div>
                                                            </div>
                                                            <div className="modal-footer">
                                                                <div className="table text-center">
                                                                    <button type="button"
                                                                            onClick={this.showPaymentReview}
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
                        ''
                }

                { this.state.showUpdatePaymentMethodModal &&
                    <UpdatePaymentMethodModal
                        isOpen={true}
                        booking={this.state.updatePaymentMethodBooking}
                        authorityId={this.props.account.id}
                        onClose={() => this.setShowUpdatePaymentMethodModal(false)}
                        onSuccess={this.onUpdatePaymentMethodSuccess}
                        returnTo="my-bookings"
                    />
                }

            </div>
        )
    }
}

export default BookedSpaces;
