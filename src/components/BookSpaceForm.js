import React, {Component} from 'react';
import "../css/components/bookSpaceForm.css";
import '../css/theme/mainContent.css';
import '../css/theme/forms.css';
import '../css/theme/forms-block.css';
import '../css/theme/buttons.css';
import {
    formatCurrencyValue,
    getPricePerDayFromMonthlyRate,
    getPricePerDayFromWeeklyRate,
    parseCurrencyValue,
    validateCurrencyValue
} from "../util/PaymentUtils";
import {createLogoutOnFailureHandler, logout} from "../util/LogoutUtil";
import Select from "./Select";
import Error from "./Error";
import Busy from "./Busy";
import {FREQUENCY_TYPE_MONTHLY, FREQUENCY_TYPE_WEEKLY, FrequencyOptions} from "../controls/FrequencyOption";
import {Link} from "react-router-dom";
import ToggleButton from "./ToggleButton";
import CheckBox from "./CheckBox";
import ActionButton from "./ActionButton";
import EquipmentTypes from "../components/EquipmentTypes";
import LocationFeatures from "../components/LocationFeatures";
import ReactTooltip from 'react-tooltip';

import HubspotApi from "../util/HubspotApi";
import moment from "moment";
import {ErrorMessage} from "./constants/book-space-constants";

const LOCATION_FEATURES = LocationFeatures.OPTIONS;
const LOCATION_ICONS =
    [
        "../app-images/security.png",
        "../app-images/gate.png",
        "../app-images/ycamera.png",
        "../app-images/gcamera.png",
        "../app-images/lights.png",
        "../app-images/paved.png",
        "../app-images/mr.png",
        "../app-images/pick.png",
        "../app-images/inventory.png",
        "../app-images/access.png",
        "../app-images/overnight_parking.png",
        "../app-images/restrooms_small.png"
    ];
const $ = window.$;

class BookSpaceForm extends Component {
    constructor(props) {
        super(props);

        this.timeout = 0; //for search delay
        this.timeoutFunction = null;

        this.state = {
            numberOfSpaces: this.props.numberOfSpaces ? this.props.numberOfSpaces : 1,
            startDate: this.props.startDate ? this.props.startDate : '',
            endDate: this.props.endDate ? this.props.endDate : '',
            assetType: '',
            assetLength: '',
            agreementAccepted: false,
            brokeredBooking: false,
            brokeredInitialChargeAlreadyPaid: false,
            brokeredRecurringChargeAlreadyPaid: false,
            brokeredSupplierPaidPerOccurrence: '',
            brokeredBuyerChargedPerOccurrence: '',
            brokeredSupplierOverageRatePaid: '',
            brokeredBuyerOverageRateCharged: '',
            payWithAch: false,
            errorMessage: '',
            showOrderSummary: false,
            recurringBooking: this.props.recurringBooking,
            frequencyTypeOptions: this.props.frequencyTypeOptions,
            selectedFrequencyType: this.props.selectedFrequencyType,
            selectedFrequencyTypeOption: this.props.selectedFrequencyTypeOption,
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
            account: '',
            redirectToHome: false
        };
    }

    componentDidMount() {
        this.initDatePickers();
        this.recalculateBookingChargeAmount(this.props);
        if ((this.props.account && this.props.account.userType !== 'ADMIN') && !this.props.supplier.pricePerDay) {
            //This Supplier only supports Monthly bookings
            this.handleRecurringBookingToggleUser(true);
        }
        //Always reset the agreementAccepted flag when the page loads.
        this.setState({agreementAccepted: false});
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.supplier.locationId !== nextProps.supplier.locationId) {
            this.recalculateBookingChargeAmount(nextProps);
        }
        if (this.props.startDate !== nextProps.startDate) {
            this.handleChange({
                target: {
                    name: "startDate",
                    value: nextProps.startDate
                }
            });
        }
        if (this.props.endDate !== nextProps.endDate && !this.state.recurringBooking) {
            this.handleChange({
                target: {
                    name: "endDate",
                    value: nextProps.endDate
                }
            });
        }
    }

    initDatePickers() {
        $('#startDate').datepicker({format: 'm/d/yyyy'}).on('changeDate', this.handleChange);
        $('#endDate').datepicker({format: 'm/d/yyyy'}).on('changeDate', this.handleChange);
        $('#bookSpaceDatesFieldset').datepicker({
            inputs: $('#startDate, #endDate')
        });
    }


    handleChange = event => {
        let name = event.target.name;
        let value = (event.target.type === 'checkbox') ? event.target.checked : event.target.value;

        let self = this;

        //Only allow integers to be typed in the numberOfSpaces field
        if ('numberOfSpaces' === name && (!BookSpaceForm.isInteger(value) || value > 9999)) {
            return;
        }
        if ('startDate' === name) {
            if (value !== this.state.endDate && !this.state.recurringBooking) {
                //This condition is only true if the date range feature has auto-updated the startDate because
                //the endDate was set to a date before the startDate.  So no need to auto-focus
                //on the endDate field in the date range.
                $('#endDate').focus();
            }
            this.setState(function (prevState) {
                return BookSpaceForm.getUpdatedRecurringProperties(value, prevState.recurringBooking, prevState.selectedFrequencyType,
                    prevState.selectedFrequencyTypeOption);
            });
        }
        if ('selectedFrequencyTypeOption' === name) {
            this.setState(function (prevState) {
                return BookSpaceForm.getUpdatedRecurringProperties(prevState.startDate,
                    prevState.recurringBooking, prevState.selectedFrequencyType, value);
            }, () => this.recalculateBookingChargeAmount(this.props));
            return;
        }

        if ('brokeredSupplierPaidPerOccurrence' === name || 'brokeredBuyerChargedPerOccurrence' === name || 'brokeredSupplierOverageRatePaid' === name || 'brokeredBuyerOverageRateCharged' === name) {
            if (!validateCurrencyValue(value)) {
                return;
            }
            value = parseCurrencyValue(value);
        }

        if (name === 'numberOfSpaces') {
            this.setState({
                [name]: value,
                errorMessage: null
            });
            clearTimeout(this.timeoutFunction);
            this.timeoutFunction = setTimeout(() => {
                    self.recalculateBookingChargeAmount(self.props);
                }, 1000
            );
        } else {
            this.setState({
                [name]: value,
                errorMessage: null
            }, () => {
                if (['numberOfSpaces',
                    'startDate',
                    'endDate',
                    'brokeredBooking',
                    'brokeredInitialChargeAlreadyPaid',
                    'brokeredRecurringChargeAlreadyPaid',
                    'brokeredSupplierPaidPerOccurrence',
                    'brokeredBuyerChargedPerOccurrence',
                    'brokeredSupplierOverageRatePaid',
                    'brokeredBuyerOverageRateCharged',
                    'assetType'
                ].includes(name)) {
                    this.recalculateBookingChargeAmount(this.props);
                }
            });
        }

    };

    createContact = data => {

        HubspotApi.createDeal(data.id)
            .then(function (data) {
                console.log('success');
            })
            .catch(function (err) {
                console.log('error');

            });
    };

    calculateRate = () => {
        let selectedEq = EquipmentTypes.getRatesByEqType(this.state, this.props.supplier.equipmentTypesAll);
        let dayRate = 0;
        let weekRate = 0;
        let monthRate = 0;

        if (selectedEq) {
            dayRate = selectedEq['pricePerDay'];
            weekRate = selectedEq['pricePerWeek'];
            monthRate = selectedEq['pricePerMonth'];
        }

        dayRate = dayRate ? dayRate : this.props.supplier.pricePerDay;

        weekRate = weekRate ? weekRate : this.props.supplier.pricePerWeek;

        monthRate = monthRate ? monthRate : this.props.supplier.pricePerMonth;

        if (this.state.recurringBooking) {
            if (this.state.selectedFrequencyType.value === FREQUENCY_TYPE_WEEKLY.value) {
                return weekRate;
            } else if (this.state.selectedFrequencyType.value === FREQUENCY_TYPE_MONTHLY.value) {
                return monthRate;
            } else {
                return 0;
            }
        } else {
            return dayRate;
        }
    };

    recalculateBookingChargeAmount(propsToUse) {
        let rate = this.calculateRate();

        this.props.rateChange(rate);
        let requiredValues = [
            propsToUse.supplier.id,
            (propsToUse.account || {}).id,
            propsToUse.supplier.locationId,
            this.state.numberOfSpaces,
            this.state.startDate,
            this.state.endDate,
            rate
        ];

        let shouldRefreshAmounts = this.state.recurringBooking ?
            [...requiredValues, this.state.selectedFrequencyTypeOption.value, this.state.selectedFrequencyType.value].every(value => value) :
            requiredValues.every(value => value);
        if (shouldRefreshAmounts) {
            this.setState({
                initialBookingPaymentAmount: "Calculating....",
                initialBookingPaymentProcessingFee: "Calculating....",
                initialBookingChargeAmount: "Calculating....",
                totalNumberOfPayments: "Calculating...",
                recurringBookingPaymentAmount: "Calculating....",
                recurringBookingPaymentProcessingFee: "Calculating....",
                recurringBookingChargeAmount: "Calculating....",
                firstRecurringPaymentDate: 'Calculating...',
                lastRecurringPaymentDate: 'Calculating...'
            });
            $.ajax({
                url: 'api/booking/calculate-booking-charge-amount',
                data: JSON.stringify({
                    supplierAccountId: propsToUse.supplier.id,
                    buyerAccountId: (propsToUse.account || {}).id,
                    locationId: propsToUse.supplier.locationId,
                    numberOfSpaces: this.state.numberOfSpaces,
                    startDate: this.state.startDate,
                    endDate: this.state.endDate,
                    frequency: this.state.recurringBooking ? "RECURRING" : "ONE_TIME",
                    recurrences: this.state.recurringBooking ? 9999 : 0,
                    durationType: this.state.recurringBooking ? this.state.selectedFrequencyType.value : "DAILY",
                    rate: rate,
                    assetType: this.state.assetType ? this.state.assetType : null,
                    brokeredBooking: this.state.brokeredBooking,
                    brokeredInitialChargeAlreadyPaid: this.state.brokeredInitialChargeAlreadyPaid,
                    brokeredRecurringChargeAlreadyPaid: this.state.brokeredRecurringChargeAlreadyPaid,
                    brokeredSupplierPaidPerOccurrence: this.state.brokeredSupplierPaidPerOccurrence,
                    brokeredBuyerChargedPerOccurrence: this.state.brokeredBuyerChargedPerOccurrence,
                    brokeredSupplierOverageRatePaid: this.state.brokeredSupplierOverageRatePaid,
                    brokeredBuyerOverageRateCharged: this.state.brokeredBuyerOverageRateCharged,
                    paymentMethodId: this.state.selectedPaymentMethod ? this.state.selectedPaymentMethod.id : ''
                }),
                type: 'POST',
                contentType: 'application/json; charset=UTF-8',
                dataType: "json",
                success: this.handleRecalculateChargeSuccess,
                error: this.handleRecalculateChargeFailure
            });
        } else {
            this.setState({
                initialBookingPaymentAmount: 0,
                initialBookingPaymentProcessingFee: 0,
                initialBookingChargeAmount: 0,
                totalNumberOfPayments: 0,
                recurringBookingPaymentAmount: 0,
                recurringBookingPaymentProcessingFee: 0,
                recurringBookingChargeAmount: 0,
                firstRecurringPaymentDate: '',
                lastRecurringPaymentDate: '',
                bookingDuration: 0,
            });
        }
    }

    handleRecalculateChargeSuccess = data => {
        this.setState({
            errorMessage: '',
            initialBookingPaymentAmount: data.initialBookingPaymentAmount,
            initialBookingPaymentProcessingFee: (!this.state.selectedPaymentMethod || (this.state.selectedPaymentMethod && this.state.selectedPaymentMethod.type === 'ACH')) || this.state.brokeredBooking ? 0 : data.initialBookingPaymentProcessingFee,
            initialBookingChargeAmount: data.initialBookingChargeAmount,
            totalNumberOfPayments: data.totalNumberOfPayments,
            recurringBookingPaymentAmount: data.recurringBookingPaymentAmount,
            recurringBookingPaymentProcessingFee: (!this.state.selectedPaymentMethod || (this.state.selectedPaymentMethod && this.state.selectedPaymentMethod.type === 'ACH')) || this.state.brokeredBooking ? 0 : data.recurringBookingPaymentProcessingFee,
            recurringBookingChargeAmount: data.recurringBookingChargeAmount,
            firstRecurringPaymentDate: data.firstRecurringPaymentDate,
            lastRecurringPaymentDate: data.lastRecurringPaymentDate,
            bookingDuration: data.duration,
        })
    };

    handleRecalculateChargeFailure = (jqXHR, textStatus, errorThrown) => {
        let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message ? jqXHR.responseJSON.message.trim() : "" : "";

        this.setState({
            errorMessage: errorMessage ? errorMessage : "An error occurred while calculating booking amounts.",
            initialBookingPaymentAmount: 0,
            initialBookingPaymentProcessingFee: 0,
            initialBookingChargeAmount: 0,
            totalNumberOfPayments: 0,
            recurringBookingPaymentAmount: 0,
            recurringBookingPaymentProcessingFee: 0,
            recurringBookingChargeAmount: 0,
            firstRecurringPaymentDate: '',
            lastRecurringPaymentDate: '',
            bookingDuration: 0,
        });
    };

    static getUpdatedRecurringProperties(startDate, recurringBooking, selectedFrequencyType, selectedFrequencyTypeOption) {
        if (recurringBooking) {
            let frequencyOptions = new FrequencyOptions(startDate);
            let frequencyTypeOptions = frequencyOptions.createOptions(selectedFrequencyType);
            let updatedSelectedFrequencyTypeOption;
            if (selectedFrequencyTypeOption && selectedFrequencyTypeOption.getFrequencyType() === selectedFrequencyType) {
                updatedSelectedFrequencyTypeOption = selectedFrequencyTypeOption.recreatedFromStartDate(startDate);
            } else {
                updatedSelectedFrequencyTypeOption = frequencyTypeOptions[0];
            }
            return {
                frequencyTypeOptions: frequencyTypeOptions,
                selectedFrequencyTypeOption: updatedSelectedFrequencyTypeOption,
                endDate: updatedSelectedFrequencyTypeOption.getFormattedEndDate()
            };
        } else {
            return {
                frequencyTypeOptions: [],
                selectedFrequencyTypeOption: ""
            }
        }
    }

    static isInteger(x) {
        return x % 1 === 0;
    }

    onBookSpaceClick = (e) => {
        var element = $('.with-scroll');

        $(element).scrollTop($(element).innerHeight());
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
                    _this.bookSpace();
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

    bookSpace = () => {
        if (!this.state.numberOfSpaces) {
            this.setError("Please enter Number Of Spaces.");
        } else if (!this.state.startDate) {
            this.setError("Please enter a Start Date.");
        } else if (!this.state.endDate) {
            this.setError("Please enter an End Date.");
        } else if (Date.parse(this.state.startDate) >= Date.parse(this.state.endDate)) {
            this.setError("End Date must be after Start Date.");
        } else if (!this.state.assetType) {
            this.setError("Please select an Equipment Type.");
        } else if (!this.state.brokeredBooking && !this.state.agreementAccepted) {
            this.setError("Please accept the agreement.");
        } else if (this.state.numberOfSpaces < this.props.supplier.minNumberOfSpaces) {
            this.setError("This supplier requires a minimum of " + this.props.supplier.minNumberOfSpaces + " spaces.");
        } else if (!this.state.recurringBooking && this.state.bookingDuration < BookSpaceForm.convertDuration(this.props.supplier.minDuration)) {
            this.setError("This supplier requires a minimum of " + BookSpaceForm.convertDuration(this.props.supplier.minDuration) + " days.");
        } else if (!this.state.brokeredBooking && !this.state.selectedPaymentMethod) {
            this.setError("Please select a payment method.");
        } else {
            this.setState({errorMessage: ""});
            Busy.set(true);
            if (this.state.brokeredBooking) {
                $.ajax({
                    url: 'api/booking',
                    data: JSON.stringify({
                        supplierAccountId: this.props.supplier.id,
                        buyerAccountId: this.props.account.id,
                        locationId: this.props.supplier.locationId,
                        numberOfSpaces: this.state.numberOfSpaces,
                        startDate: this.state.startDate,
                        endDate: this.state.endDate,
                        frequency: this.state.recurringBooking ? "RECURRING" : "ONE_TIME",
                        recurrences: this.state.recurringBooking ? this.state.selectedFrequencyTypeOption.value : 0,
                        durationType: this.state.recurringBooking ? this.state.selectedFrequencyType.value : "DAILY",
                        rate: this.calculateRate(),
                        initialCharge: this.state.initialBookingChargeAmount,
                        recurringCharge: this.state.recurringBooking ? this.state.recurringBookingChargeAmount : 0,
                        assetType: this.state.assetType,
                        brokeredBooking: this.state.brokeredBooking,
                        brokeredInitialChargeAlreadyPaid: this.state.brokeredInitialChargeAlreadyPaid,
                        brokeredRecurringChargeAlreadyPaid: this.state.brokeredRecurringChargeAlreadyPaid,
                        brokeredSupplierPaidPerOccurrence: this.state.brokeredSupplierPaidPerOccurrence,
                        brokeredBuyerChargedPerOccurrence: this.state.brokeredBuyerChargedPerOccurrence,
                        brokeredSupplierOverageRatePaid: this.state.brokeredSupplierOverageRatePaid,
                        brokeredBuyerOverageRateCharged: this.state.brokeredBuyerOverageRateCharged,
                        source: "MARKETPLACE"
                    }),
                    type: 'POST',
                    contentType: 'application/json; charset=UTF-8',
                    dataType: "json",
                    success: this.handleSuccess,
                    error: this.handleFailure
                });
            } else {
                $.ajax({
                    url: 'api/booking',
                    data: JSON.stringify({
                        supplierAccountId: this.props.supplier.id,
                        buyerAccountId: this.props.account.id,
                        locationId: this.props.supplier.locationId,
                        numberOfSpaces: this.state.numberOfSpaces,
                        startDate: this.state.startDate,
                        endDate: this.state.endDate,
                        frequency: this.state.recurringBooking ? "RECURRING" : "ONE_TIME",
                        recurrences: this.state.recurringBooking ? this.state.selectedFrequencyTypeOption.value : 0,
                        durationType: this.state.recurringBooking ? this.state.selectedFrequencyType.value : "DAILY",
                        rate: this.calculateRate(),
                        initialCharge: this.state.initialBookingChargeAmount,
                        recurringCharge: this.state.recurringBooking ? this.state.recurringBookingChargeAmount : 0,
                        assetType: this.state.assetType,
                        paymentMethodId: this.state.selectedPaymentMethod.id,
                        tosDocUrl: this.getAgreementUrl(),
                        source: "MARKETPLACE"
                    }),
                    type: 'POST',
                    contentType: 'application/json; charset=UTF-8',
                    dataType: "json",
                    success: this.handleSuccess,
                    statusCode: {
                        401: createLogoutOnFailureHandler(this.props.handleLogout)
                    },
                    error: this.handleFailure
                });
            }
        }
    };

    setError = (errorMessage) => {
        this.setState({errorMessage: errorMessage}, () => {
            document.getElementsByClassName("ss-error")[0].scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
        });
    };

    static convertDuration(duration) {
        if (duration === 'MONTHLY') {
            return 30;
        } else if (duration === 'WEEKLY') {
            return 7;
        } else {
            return 0;
        }
    }

    handleSuccess = (data) => {
        window.dataLayer.push({
            'event': 'booking_success'
        });
        //create Hubspot contact && deal
        this.createContact(data);
        this.setState({
            errorMessage: '',
            agreementAccepted: false
        });
        this.props.onSuccess(data.orderNumber, data.autoApproved);
        this.props.readSupplierPendingBooking();
    };

    handleFailure = (jqXHR, textStatus, errorThrown) => {
        let errorMessage = jqXHR.responseJSON && jqXHR.responseJSON.message ? jqXHR.responseJSON.message : ErrorMessage.BOOK_SPACE_FAILED;
        this.props.onError(errorMessage);
        this.setState({
            errorMessage: errorMessage
        });
    };

    getAgreementUrl = () => {
        return this.props.supplier.supplierLegalAgreementFileName ?
            'https://s3-us-west-1.amazonaws.com/securspace-files/legal-agreements/' + this.props.supplier.supplierLegalAgreementFileName
            :
            'https://s3-us-west-1.amazonaws.com/securspace-files/app-files/RESERVATION+AGREEMENT.pdf';
    };

    togglePayWithAch = () => {
        this.setState({payWithAch: !this.state.payWithAch}, () => this.recalculateBookingChargeAmount(this.props));
    };

    selectPayWithCardClassName = () => {
        return "ss-button-primary-left" + (!this.state.payWithAch ? " ss-button-primary-selected" : " ss-button-primary-deselected");
    };

    selectPayWithAchClassName = () => {
        return "ss-button-primary-right" + (this.state.payWithAch ? " ss-button-primary-selected" : " ss-button-primary-deselected");
    };

    handleRecurringBookingToggle = value => {

        this.setState(function (prevState) {
            let recurringBooking = value;
            let selectedFrequencyType = recurringBooking ? FREQUENCY_TYPE_WEEKLY : "";
            return Object.assign(
                {
                    recurringBooking: recurringBooking,
                    selectedFrequencyType: selectedFrequencyType
                },
                BookSpaceForm.getUpdatedRecurringProperties(
                    prevState.startDate,
                    recurringBooking,
                    selectedFrequencyType,
                    prevState.selectedFrequencyTypeOption
                ));
        }, () => {
            this.props.handleFrequencyChange(this.state.recurringBooking, this.state.selectedFrequencyType);
            this.recalculateBookingChargeAmount(this.props);
        });

    };

    handleRecurringBookingToggleUser = value => {

        this.setState(function (prevState) {
            let recurringBooking = value;
            //let selectedFrequencyType = recurringBooking ? FREQUENCY_TYPE_WEEKLY : "";
            let selectedFrequencyType = recurringBooking ? FREQUENCY_TYPE_MONTHLY : "";
            return Object.assign(
                {
                    recurringBooking: recurringBooking,
                    selectedFrequencyType: selectedFrequencyType
                },

                BookSpaceForm.getUpdatedRecurringProperties(
                    prevState.startDate,
                    recurringBooking,
                    selectedFrequencyType,
                    prevState.selectedFrequencyTypeOption
                ));
        }, () => {
            this.props.handleFrequencyChange(
                this.state.recurringBooking,
                this.state.selectedFrequencyType,
                this.state.frequencyTypeOptions,
                this.state.selectedFrequencyTypeOption,
                this.state.endDate
            );
            this.recalculateBookingChargeAmount(this.props);
        });

    };

    handleFrequencyTypeSelected = isActive => {

        const value = isActive ? FREQUENCY_TYPE_WEEKLY : FREQUENCY_TYPE_MONTHLY;

        this.setState((prevState) =>
            Object.assign(
                {
                    selectedFrequencyType: value
                },
                BookSpaceForm.getUpdatedRecurringProperties(
                    prevState.startDate,
                    prevState.recurringBooking,
                    value,
                    prevState.selectedFrequencyTypeOption
                )
            ), () => {
            this.recalculateBookingChargeAmount(this.props);
            this.props.handleFrequencyChange(
                this.state.recurringBooking,
                this.state.selectedFrequencyType,
                this.state.frequencyTypeOptions,
                this.state.selectedFrequencyTypeOption,
                this.state.endDate
            );
        });
    };

    getOccurrenceLabel = () => {
        if (this.state.recurringBooking) {
            if (this.state.selectedFrequencyType.value === FREQUENCY_TYPE_WEEKLY.value) {
                return "Week";
            } else if (this.state.selectedFrequencyType.value === FREQUENCY_TYPE_MONTHLY.value) {
                return "Month";
            } else {
                return 0;
            }
        } else {
            return "Day";
        }
    };

    getAssetTypeOptions = () => {
        let options = [];

        if (this.props.supplier.equipmentTypes) {
            let _this = this;
            EquipmentTypes.jsonTypes.forEach(function (eqType) {
                if (_this.props.supplier.equipmentTypes.indexOf(eqType.assetType) > -1 && options.indexOf(eqType.assetType) === -1) {
                    options.push(eqType.assetType);
                }
            });
        }
        return options;
    };

    handlePaymentMethodChange = event => {
        let value = event.target.checked;
        let paymentMethodId = event.target.id;

        if (value) {
            let selectedPaymentMethod = this.props.paymentMethods.find(function (paymentMethod) {
                return paymentMethod.id === paymentMethodId;
            });
            this.setState({
                selectedPaymentMethod: selectedPaymentMethod
            }, () => {
                this.recalculateBookingChargeAmount(this.props);
            });
        }
    };

    static formatPhoneNumber = (value) => {
        let formattedValue = "";
        if (value && value.length > 0) {
            let length = value.length;
            let areaCode;
            if (length >= 3) {
                areaCode = value.substring(0, 3);
            } else {
                areaCode = value.substring(0, length);
            }
            let prefix = "";
            if (length >= 6) {
                prefix = value.substring(3, 6);
            } else if (length > 3) {
                prefix = value.substring(3, length);
            }
            let suffix = "";
            if (length >= 10) {
                suffix = value.substring(6, 10);
            } else if (length > 6) {
                suffix = value.substring(6, length);
            }
            formattedValue = "(" + areaCode + ") " + prefix + "-" + suffix;
        }
        return formattedValue;
    };

    logInAsPartner = (event) => {
        Busy.set(true);
        $.ajax({
            url: '/api/login-as-account',
            data: JSON.stringify({
                id: this.props.supplier.id
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: this.handleLogInAsPartnerSuccess,
            error: this.handleLogInAsPartnerFailure
        });
        event.preventDefault();
    };

    handleLogInAsPartnerSuccess = (loggedInAccount) => {
        Busy.set(false);
        this.props.handleAccountChange(loggedInAccount);
    };

    handleLogInAsPartnerFailure = (jqXHR, textStatus, errorThrown) => {
        Busy.set(false);
        let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "Internal Server Error";
        this.props.onError(errorMessage);
        this.setState({
            errorMessage: errorMessage
        });
    };

    getPaymentDay(date, frequencyType) {
        if (frequencyType.name === "Monthly") {
            return this.getMonthlyPaymentDay(date);
        } else {
            return this.getWeeklyPaymentDay(date);
        }
    }

    getMonthlyPaymentDay(date) {
        let dayOfMonth = new Date(date).getDate();
        let ordinalIndicator ='';
        switch(dayOfMonth){
            case 1:
            case 21:
            case 31:
                ordinalIndicator = 'st';
                break;
            case 2:
            case 22:
                ordinalIndicator = 'nd';
                break;
            case 3:
            case 23:
                ordinalIndicator = 'rd';
                break;
            default:
                ordinalIndicator = 'th';
                break;
        }
        return dayOfMonth + ordinalIndicator;
    }

    getWeeklyPaymentDay(date) {
        let dayOfWeek = new Date(date).getDay();
        switch(dayOfWeek){
            case 0:
                return 'Sunday';
            case 1:
                return 'Monday';
            case 2:
                return 'Tuesday';
            case 3:
                return 'Wednesday';
            case 4:
                return 'Thursday';
            case 5:
                return 'Friday';
            case 6:
                return 'Saturday';
            default:
                return '';
        }
    }

    render() {
        let locationEqType = EquipmentTypes.sortLocationEquipmentTypes(this.props.supplier.equipmentTypesAll);

        return (
            <form>
                {
                    this.props.account && this.props.account.userType === 'ADMIN' ?
                        <div>
                            <CheckBox checked={this.state.brokeredBooking}
                                      onCheck={(value) => this.setState({brokeredBooking: value})}>
                                Brokered Booking
                            </CheckBox>
                            <hr/>
                            {
                                this.state.brokeredBooking ?
                                    <div>
                                        <div className="ss-book-space-form-checkbox-container">
                                            <CheckBox checked={this.state.brokeredInitialChargeAlreadyPaid}
                                                      onCheck={(value) => this.setState({brokeredInitialChargeAlreadyPaid: value}, () => {
                                                          this.recalculateBookingChargeAmount(this.props);
                                                      })}>
                                                Initial Charge Already Paid
                                            </CheckBox>
                                        </div>
                                        <div className="ss-book-space-form-checkbox-container">
                                            <CheckBox checked={this.state.brokeredRecurringChargeAlreadyPaid}
                                                      onCheck={(value) => this.setState({brokeredRecurringChargeAlreadyPaid: value}, () => {
                                                          this.recalculateBookingChargeAmount(this.props);
                                                      })}>
                                                Recurring Charge Already Paid
                                            </CheckBox>
                                        </div>
                                        <hr/>
                                        <fieldset className="ss-book-space-form-input-row">
                                            <label className="ss-book-space-form-row-label"
                                                   htmlFor="brokeredSupplierPaidPerOccurrence"
                                                   style={{marginLeft: "0", fontWeight: "500"}}>Supplier Payout
                                                Amount
                                                Per {this.getOccurrenceLabel()}</label>
                                            <span><input type="text"
                                                         className="ss-book-space-form-input-input"
                                                         id="brokeredSupplierPaidPerOccurrence"
                                                         name="brokeredSupplierPaidPerOccurrence"
                                                         value={formatCurrencyValue(this.state.brokeredSupplierPaidPerOccurrence, true)}
                                                         onChange={this.handleChange}
                                                         style={{
                                                             width: this.state.brokeredSupplierPaidPerOccurrence ? "200px" : "calc(100% - 50px)",
                                                             marginLeft: "0"
                                                         }}
                                                         maxLength={30}
                                                         placeholder={"Enter the Supplier payout per " + this.getOccurrenceLabel()}
                                            /></span>
                                        </fieldset>
                                        <hr/>
                                        <fieldset className="ss-book-space-form-input-row">
                                            <label className="ss-book-space-form-row-label"
                                                   htmlFor="brokeredBuyerChargedPerOccurrence"
                                                   style={{marginLeft: "0", fontWeight: "500"}}>Customer Charged
                                                Amount
                                                Per {this.getOccurrenceLabel()}</label>
                                            <span><input type="text"
                                                         className="ss-book-space-form-input-input"
                                                         id="brokeredBuyerChargedPerOccurrence"
                                                         name="brokeredBuyerChargedPerOccurrence"
                                                         value={formatCurrencyValue(this.state.brokeredBuyerChargedPerOccurrence, true)}
                                                         onChange={this.handleChange}
                                                         style={{
                                                             width: this.state.brokeredBuyerChargedPerOccurrence ? "200px" : "calc(100% - 50px)",
                                                             marginLeft: "0"
                                                         }}
                                                         maxLength={30}
                                                         placeholder={"Enter the Customer charge per " + this.getOccurrenceLabel()}
                                            /></span>
                                        </fieldset>
                                        <hr/>
                                        <fieldset className="ss-book-space-form-input-row">
                                            <label className="ss-book-space-form-row-label"
                                                   htmlFor="brokeredSupplierOverageRatePaid"
                                                   style={{marginLeft: "0", fontWeight: "500"}}>Overage Supplier
                                                Payout
                                                Rate</label>
                                            <span><input type="text"
                                                         className="ss-book-space-form-input-input"
                                                         id="brokeredSupplierOverageRatePaid"
                                                         name="brokeredSupplierOverageRatePaid"
                                                         value={formatCurrencyValue(this.state.brokeredSupplierOverageRatePaid, true)}
                                                         onChange={this.handleChange}
                                                         style={{
                                                             width: this.state.brokeredSupplierOverageRatePaid ? "200px" : "calc(100% - 50px)",
                                                             marginLeft: "0"
                                                         }}
                                                         maxLength={30}
                                                         placeholder="Enter the Supplier Overate payout"
                                            /></span>
                                        </fieldset>
                                        <hr/>
                                        <fieldset className="ss-book-space-form-input-row">
                                            <label className="ss-book-space-form-row-label"
                                                   htmlFor="brokeredBuyerOverageRateCharged"
                                                   style={{marginLeft: "0", fontWeight: "500"}}>Overage Customer
                                                Charge
                                                Rate</label>
                                            <span><input type="text"
                                                         className="ss-book-space-form-input-input"
                                                         id="brokeredBuyerOverageRateCharged"
                                                         name="brokeredBuyerOverageRateCharged"
                                                         value={formatCurrencyValue(this.state.brokeredBuyerOverageRateCharged, true)}
                                                         onChange={this.handleChange}
                                                         style={{
                                                             width: this.state.brokeredBuyerOverageRateCharged ? "200px" : "calc(100% - 50px)",
                                                             marginLeft: "0"
                                                         }}
                                                         maxLength={30}
                                                         placeholder="Enter the Customer Overage rate"
                                            /></span>
                                        </fieldset>
                                        <hr/>
                                    </div>
                                    :
                                    ''
                            }
                        </div>
                        :
                        ''
                }
                {
                    this.props.account && this.props.account.userType === 'ADMIN' ?
                        <div className="book-space-admin-panel">
                            <p className="title-text">Admin Info</p>
                            <div>
                                <div className={'book-space-admin-label'}>
                                    <label>DISTANCE:</label>
                                    <div className='book-space-admin-value'>{this.props.supplier.distance} mi</div>
                                </div>
                                <div className={'book-space-admin-label'}>
                                    <label>PARTNER NAME:</label>
                                    <div className='book-space-admin-value'>{this.props.supplier.companyName}</div>
                                </div>
                                <div className={'book-space-admin-label'}>
                                    <label>PARTNER EMAIL:</label>
                                    <div className='book-space-admin-value'>{this.props.supplier.companyEmail}</div>
                                </div>
                                <div className={'book-space-admin-label'}>
                                    <label>PARTNER PHONE:</label>
                                    <div className='book-space-admin-value'>{BookSpaceForm.formatPhoneNumber(this.props.supplier.companyPhoneNumber)}</div>
                                </div>
                                <div className={'book-space-admin-label'}>
                                    <label>LOCATION PHONE:</label>
                                    <div className='book-space-admin-value'>{BookSpaceForm.formatPhoneNumber(this.props.supplier.locationPhoneNumber)}</div>
                                </div>
                                <div className={'book-space-admin-label'}>
                                    <label>MAX SPACES BOOKED:</label>
                                    <div className='book-space-admin-value'>{this.props.supplier.maxSpacesBooked}</div>
                                </div>
                                <div className={'book-space-admin-label'}>
                                    <label>AUTO-APPROVE SPACES:</label>
                                    <div className='book-space-admin-value'>{this.props.supplier.managedSpaces}</div>
                                </div>
                                <div className={'book-space-admin-label'}>
                                    <label>TOTAL SPACES:</label>
                                    <div className='book-space-admin-value'>{this.props.supplier.totalNumberOfSpaces}</div>
                                </div>
                                <div className={'book-space-admin-label'}>
                                    <label>MIN BOOKING SPACES:</label>
                                    <div className='book-space-admin-value'>{this.props.supplier.minNumberOfSpaces}</div>
                                </div>
                                <div className={'book-space-admin-label'}>
                                    <label>MIN BOOKING DURATION:</label>
                                    <div className='book-space-admin-value'>{this.props.supplier.minDuration}</div>
                                </div>
                                <div className={'book-space-admin-label'}>
                                    <label>CURRENT INVENTORY:</label>
                                    <div className='book-space-admin-value'>{this.props.supplier.currentInventoryCount}</div>
                                </div>
                                <div className={'book-space-admin-label'}>
                                    <label>DEFAULT COMMISSION:</label>
                                    <div className='book-space-admin-value'>{this.props.supplier.commissionRate}</div>
                                </div>
                                <div className="book-space-admin-footer">
                                    {
                                        this.props.account && this.props.account.type !== 'Admin' ?
                                            <div className='book-space-admin-info'>CURRENTLY LOGGED IN AS: {this.props.account.companyName}</div>
                                            :
                                            <button className="ss-button-primary" onClick={this.logInAsPartner}>Log In As Partner</button>
                                    }
                                </div>
                            </div>
                            <div className="clear"/>
                        </div>
                        :
                        ''
                }

                <div className="ss-description">
                    <p className="title-text">Description</p>
                    <div>{this.props.supplier.locationDescription}</div>
                    <div className="clear"/>
                </div>

                <div className="ss-features title-text">
                    <p className="title-text">Location Features</p>
                    <div>
                        {
                            (this.props.supplier.features && this.props.supplier.features.length > 0) ?
                                this.props.supplier.features.map((item, index) =>
                                    <div key={index} className="col-lg-4 col-md-4 col-sm-6 col-xs-12">
                                        <img alt={item} data-tip
                                             data-for={'img' + index}
                                             src={LOCATION_ICONS[LOCATION_FEATURES.indexOf(item)]}/>
                                        <span>{item}</span>
                                    </div>
                                )
                                : null
                        }
                    </div>
                    <div className="clear"/>
                </div>

                <div className="booking-prices">
                    <p className="title-text">Prices</p>
                    <div className="large-width">
                        <div className="row">
                            <div className="col-lg-6 col-md-12 col-sm-12 col-xs-12">
                                <label><strong>Equipment Type</strong>
                                    <span data-tip
                                          data-for='eqType'
                                          className="question-tooltip"><span
                                        className="glyphicon glyphicon-question-sign"
                                        aria-hidden="true"/></span>
                                </label>

                                <ReactTooltip id="eqType"
                                              type="success"
                                              effect="solid"
                                              place="top"
                                              className="tooltip-tip-hover">
                                    <p>These are all types of equipments this facility can accept</p>
                                </ReactTooltip>
                            </div>
                            <div className="col-lg-2 col-md-4 col-sm-4 col-xs-4">
                                <strong>Price/day</strong>
                            </div>
                            {
                                this.props.account && this.props.account.userType === 'ADMIN' ?
                                    <div className="col-lg-2 col-md-4 col-sm-4 col-xs-4">
                                        <strong>Price/week</strong>
                                    </div>
                                    : null
                            }
                            <div className="col-lg-2 col-md-4 col-sm-4 col-xs-4">
                                <strong>Price/month</strong>
                            </div>
                        </div>

                        {
                            locationEqType.map((item, index) =>
                                <div className="row" key={index}>
                                    <div className="col-lg-6 col-md-12 col-sm-12 col-xs-12">
                                        <img alt=""
                                             src={'./app-images/' + EquipmentTypes.getIconByName(item.equipmentType)}/>{item.equipmentType}
                                    </div>
                                    <div className="col-lg-2 col-md-4 col-sm-4 col-xs-4">
                                        {item.pricePerDay ? formatCurrencyValue(item.pricePerDay, true) :
                                            (this.props.supplier.pricePerDay ? formatCurrencyValue(this.props.supplier.pricePerDay, true) : '')}
                                    </div>
                                    { this.props.account && this.props.account.userType === 'ADMIN' ?
                                        <div className="col-lg-2 col-md-4 col-sm-4 col-xs-4">
                                            {item.pricePerWeek ? formatCurrencyValue(item.pricePerWeek, true) :
                                                (this.props.supplier.pricePerWeek ? formatCurrencyValue(this.props.supplier.pricePerWeek, true) : '')}
                                            <div className="calculated-field">
                                                {item.pricePerWeek ? "($" + getPricePerDayFromWeeklyRate(item.pricePerWeek) + "/day)" :
                                                    (this.props.supplier.pricePerWeek ? "($" + getPricePerDayFromWeeklyRate(this.props.supplier.pricePerWeek) + "/day)" : '')}
                                            </div>
                                        </div>
                                        : null
                                    }
                                    <div className="col-lg-2 col-md-4 col-sm-4 col-xs-4">
                                        {item.pricePerMonth ? formatCurrencyValue(item.pricePerMonth, true) :
                                            (this.props.supplier.pricePerMonth ? formatCurrencyValue(this.props.supplier.pricePerMonth, true) : '')}
                                        <div className="calculated-field">
                                            {item.pricePerMonth ? "($" + getPricePerDayFromMonthlyRate(item.pricePerMonth) + "/day)" :
                                                (this.props.supplier.pricePerMonth ? "($" + getPricePerDayFromMonthlyRate(this.props.supplier.pricePerMonth) + "/day)" : '')}
                                        </div>
                                    </div>
                                </div>
                            )}

                    </div>
                    < div className="clear"></div>
                </div>

                {
                    this.props.supplier.overageRate &&
                    <div className="overage-container">
                        <div className="overage-info-header">
                            <p className="title-text">Current Overage Rate</p>
                            <span data-tip
                                  data-for='eqType'
                                  className="question-tooltip"><span
                                className="glyphicon glyphicon-question-sign overage-info-tooltip"
                                aria-hidden="true"/></span>
                            <ReactTooltip id="eqType"
                                          type="success"
                                          effect="solid"
                                          place="top"
                                          className="tooltip-tip-hover">
                                <p>Overage Rate at time of booking is not guaranteed and is subject to change. If a
                                    customer brings in more equipment than is pre-paid, the yard has the right to
                                    charge a higher rate for overages based on yard congestion
                                </p>
                            </ReactTooltip>
                        </div>
                        <div className="overage-price-container">
                            <div className="overage-price-label">Price/day</div>
                            <div className="overage-price-value">{formatCurrencyValue(this.props.supplier.overageRate, true)}</div>
                        </div>
                    </div>
                }

                {this.props.account && this.props.account.id ?
                    <div>
                        <p className="title-text">Booking Details</p>
                        <div>
                            {
                                this.props.account && this.props.account.userType === 'ADMIN' ?
                                    <div>
                                        <label> RECURRING
                                            <span data-tip
                                                  data-for='recurring'
                                                  className="question-tooltip"><span
                                                className="glyphicon glyphicon-question-sign"
                                                aria-hidden="true"/></span>
                                        </label>

                                        <ReactTooltip id="recurring"
                                                      type="success"
                                                      effect="solid"
                                                      place="top"
                                                      className="tooltip-tip-hover">
                                            <p>Booking for more than a month?</p>
                                            <p>Click <strong>"Yes"</strong> to create a Recurring booking.</p>
                                            <p>You can lock in space for longer terms and
                                                enjoy easy automatic billing on the first of
                                                each month.</p>
                                        </ReactTooltip>
                                    </div>
                                    :
                                    null
                            }
                            <div className={this.props.account && this.props.account.userType === 'ADMIN' ?
                                "booking-op-row admin-booking-op-row" :
                                "booking-op-row non-admin-booking-op-row"
                            }>
                                {
                                    this.props.account && this.props.account.userType === 'ADMIN' ?
                                        <div>
                                            <ToggleButton
                                                isActive={this.state.recurringBooking}
                                                activeTag="Yes"
                                                inactiveTag="No"
                                                onToggle={this.handleRecurringBookingToggle}
                                                baseClass="ss-toggle-button-recurring-base"
                                                activeClass="ss-toggle-button-recurring-active"
                                                inactiveClass="ss-toggle-button-recurring-inactive"
                                            />
                                            {
                                                this.state.recurringBooking ?
                                                    <ToggleButton
                                                        isActive={this.state.selectedFrequencyType === FREQUENCY_TYPE_WEEKLY}
                                                        activeTag="Weekly"
                                                        inactiveTag="Monthly"
                                                        onToggle={this.handleFrequencyTypeSelected}
                                                        baseClass="ss-toggle-button-recurring-base toggle-large"
                                                        activeClass="ss-toggle-button-recurring-active"
                                                        inactiveClass="ss-toggle-button-recurring-inactive"
                                                    />
                                                    :
                                                    ''
                                            }
                                        </div>
                                        :
                                        this.props.supplier.pricePerDay ?
                                            <div>
                                                <ToggleButton
                                                    isActive={this.state.recurringBooking}
                                                    activeTag="Monthly"
                                                    inactiveTag="One-time"
                                                    onToggle={this.handleRecurringBookingToggleUser}
                                                    baseClass="ss-toggle-button-recurring-base"
                                                    activeClass="ss-toggle-button-recurring-active"
                                                    inactiveClass="ss-toggle-button-recurring-inactive"
                                                    firstTooltip="recurring1"
                                                />
                                                <ReactTooltip id="recurring1"
                                                              type="success"
                                                              effect="solid"
                                                              place="top"
                                                              className="tooltip-tip-hover">
                                                    <p>Booking for more than a month?</p>
                                                    <p>You can lock in space for longer terms and
                                                        enjoy easy automatic billing on the first of
                                                        each month.</p>
                                                </ReactTooltip>
                                            </div>
                                            :
                                            <div>
                                                Monthly Only
                                            </div>
                                }
                                <div>

                                    <div className="w50 pull-left">
                                        <div className="hs-field">
                                            <label>{!this.state.recurringBooking ? 'FROM' : 'STARTING ON'}</label>
                                            <input type="text"
                                                   data-date-autoclose="true"
                                                   id="startDate"
                                                   name="startDate"
                                                   className="ss-book-space-form-input"
                                                   value={this.state.startDate}
                                                   onChange={this.handleChange}
                                                   title="Enter the date when whe assets will be dropped off"
                                                   placeholder="mm/dd/yyyy"
                                                   readOnly
                                            />
                                        </div>
                                    </div>
                                    <div className={this.state.recurringBooking ? "hidden" : "w50 pull-left"}>
                                        <div className="hs-field">
                                            <label>UNTIL</label>
                                            <input type="text"
                                                   className={this.state.recurringBooking ? 'hidden' : 'ss-book-space-form-input'}
                                                   data-date-autoclose="true"
                                                   id="endDate"
                                                   name="endDate"
                                                   value={this.state.endDate}
                                                   onChange={this.handleChange}
                                                   title="Enter the date when you will pick up the assets being stored"
                                                   placeholder="mm/dd/yyyy"
                                                   readOnly
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="booking-op-row">
                                <div>
                                    <div className="hs-field w100">
                                        <label>EQUIPMENT TYPE</label>
                                        <Select id="assetType"
                                                className="ss-book-space-form-select"
                                                name="assetType"
                                                handleChange={this.handleChange}
                                                selectedOption={this.state.assetType}
                                                placeholder="Choose"
                                                options={this.getAssetTypeOptions()}
                                        />
                                    </div>
                                </div>
                                <div>

                                    <div className="w100 pull-left">
                                        <div className="hs-field">
                                            <label>SPACES</label>
                                            <input type="text"
                                                   className="ss-book-space-form-input"
                                                   id="numberOfSpaces"
                                                   name="numberOfSpaces"
                                                   value={this.state.numberOfSpaces}
                                                   onChange={this.handleChange}
                                                   title="Enter the number of spaces needed"
                                            />
                                        </div>
                                    </div>

                                </div>
                            </div>
                            {
                                this.state.recurringBooking ?
                                    <p>
                                        <div className="renewal-label">This booking will renew automatically every {this.state.selectedFrequencyType.nounDesc} until cancelled.</div>
                                    </p>
                                    :
                                    ''
                            }
                            <div className="clear"/>
                        </div>
                    </div>
                    : null
                }
                { this.props.account && this.props.account.id ?
                    <div>
                        <p className="title-text">Payment Methods</p>
                        <div className="book-payment">
                            {
                                this.state.brokeredBooking || ( this.props.account && this.props.account.userType === 'ADMIN') ?
                                    ''
                                    :
                                    <fieldset>
                                        <div id="paymentMethodOptions">
                                            {
                                                this.props.paymentMethods.map((paymentMethod, index) =>
                                                    <div key={index}>
                                                        <label className="flex-center radio-container">
                                                            <p className="ss-book-space-radio-label"
                                                               htmlFor={paymentMethod.id}>
                                                                <strong>{paymentMethod.type === 'CARD' ? paymentMethod.cardBrand : paymentMethod.bankName}</strong>
                                                                &nbsp;ending
                                                                in <strong>{paymentMethod.lastFour}</strong>
                                                            </p>
                                                            <input type="radio"
                                                                   className="ss-book-space-radio-input"
                                                                   id={paymentMethod.id}
                                                                   name="paymentMethodOptions"
                                                                   value={this.state.selectedPaymentMethod && this.state.selectedPaymentMethod.id === paymentMethod.id}
                                                                   onChange={this.handlePaymentMethodChange}
                                                            />
                                                            <span className="checkmark"/>
                                                        </label>
                                                    </div>
                                                )
                                            }
                                            <Link className="like-button" to={{
                                                pathname: '/company-profile',
                                                search: '?managePaymentMethods=true&returnTo=search'
                                            }}>Add Payment Method</Link>
                                            {
                                                this.state.selectedPaymentMethod && this.state.selectedPaymentMethod.type === 'CARD' ?
                                                    <p className="help-block">
                                                        <span className="glyphicon glyphicon-info-sign"
                                                              aria-hidden="true"/>
                                                        Additional credit card processing fee applies
                                                    </p>
                                                    :
                                                    ''
                                            }
                                        </div>
                                    </fieldset>
                            }
                        </div>
                    </div>
                    : null
                }
                {this.props.account && this.props.account.id ?
                    <div>
                        <p className="title-text">Today's Payment Summary</p>
                        <div className="book-payment">
                            <div id="bookingAmountContainer">
                                {
                                    this.state.initialBookingChargeAmount === 'Calculating....' ?
                                        <div>
                                            <div>Calculating Payment Info...</div>
                                        </div>
                                        :
                                        this.state.recurringBooking ?
                                            <div>
                                                <p>
                                                    <span>First Cycle Dates Covered</span>
                                                    <span>{this.state.startDate} - {moment(this.state.firstRecurringPaymentDate).subtract(1, 'day').format('M/DD/YYYY')}</span>
                                                </p>
                                                <p>
                                                    <span>First Cycle Booking Charge</span>
                                                    <span>{this.state.initialBookingPaymentAmount === 0 ? "$0" : formatCurrencyValue(this.state.initialBookingPaymentAmount)}</span>
                                                </p>
                                                <p>
                                                    <span>Credit Card Processing Fee</span>
                                                    <span>{this.state.initialBookingPaymentProcessingFee === 0 ? "$0" : formatCurrencyValue(this.state.initialBookingPaymentProcessingFee)}</span>
                                                </p>
                                                <hr/>
                                                <p>
                                                    <span>
                                                        <strong>{this.state.recurringBooking ? "Today's Payment Total:" : "Payment Total:"}</strong>
                                                    </span>
                                                    <span>
                                                        <strong>{this.state.initialBookingChargeAmount === 0 ? "$0" : formatCurrencyValue(this.state.initialBookingChargeAmount)}</strong>
                                                    </span>
                                                </p>
                                            </div>
                                            :
                                            <div>
                                                <p>
                                                    <span>One-Time Booking Charge:</span>
                                                    <span>{this.state.initialBookingPaymentAmount === 0 ? "$0" : formatCurrencyValue(this.state.initialBookingPaymentAmount)}</span>
                                                </p>
                                                <p>
                                                    <span>Credit Card Processing Fee:</span>
                                                    <span>{this.state.initialBookingPaymentProcessingFee === 0 ? "$0" : formatCurrencyValue(this.state.initialBookingPaymentProcessingFee)}</span>
                                                </p>
                                                <hr/>
                                                <p>
                                                    <span>
                                                        <strong>Total Payment:</strong>
                                                    </span>
                                                    <span>
                                                        <strong>{this.state.initialBookingChargeAmount === 0 ? "$0" : formatCurrencyValue(this.state.initialBookingChargeAmount)}</strong>
                                                    </span>
                                                </p>
                                            </div>
                                }
                            </div>
                        </div>
                    </div>
                    : null
                }
                {(this.props.account && this.props.account.id) && this.state.recurringBooking ?
                    <div>
                        <p className="title-text">{this.state.selectedFrequencyType.name} Payment Summary</p>
                        <div className="book-payment">
                            <div id="bookingAmountContainer">
                                {
                                    this.state.initialBookingChargeAmount === 'Calculating....' ?
                                        <div>
                                            <div>Calculating Payment Info...</div>
                                        </div>
                                        :
                                        <div>
                                            <div style={{marginBottom: "20px"}}>
                                                <p>
                                                    <div className="renewal-label">This booking will renew automatically every {this.state.selectedFrequencyType.nounDesc} until cancelled.</div>
                                                </p>
                                                <p>
                                                    <span>Payment Day of {this.state.selectedFrequencyType.nounDesc}:</span>
                                                    <span>{this.getPaymentDay(this.state.firstRecurringPaymentDate, this.state.selectedFrequencyType)}</span>
                                                </p>
                                                <p>
                                                    <span>Next Payment Date:</span>
                                                    <span>{this.state.firstRecurringPaymentDate}</span>
                                                </p>
                                                <p>
                                                    <span>{this.state.selectedFrequencyType.name + ' Booking Charge:'}</span>
                                                    <span>{this.state.recurringBookingPaymentAmount === 0 ? "$0" : formatCurrencyValue(this.state.recurringBookingPaymentAmount)}</span>
                                                </p>
                                                <p>
                                                    <span>Credit Card Processing Fee</span>
                                                    <span>{this.state.recurringBookingPaymentProcessingFee === 0 ? "$0" : formatCurrencyValue(this.state.recurringBookingPaymentProcessingFee)}</span>
                                                </p>
                                                <hr/>
                                                <p>
                                                    <span>
                                                        <strong>{'Total ' + this.state.selectedFrequencyType.name + ' Payment:'}</strong>
                                                    </span>
                                                    <span>
                                                        <strong>{this.state.recurringBookingChargeAmount === 0 ? "$0" : formatCurrencyValue(this.state.recurringBookingChargeAmount)}</strong>
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                }
                            </div>
                        </div>
                    </div>
                    : null
                }
                {this.props.account && this.props.account.id ?
                    <div className="booking-last-div">
                        <div id="bookSpaceSubmitContainer">
                            {
                                this.state.brokeredBooking || (this.props.account && this.props.account.userType === 'ADMIN') ?
                                    ''
                                    :
                                    <label className="ss-checkbox">
                                        <CheckBox checked={this.state.agreementAccepted}
                                                  onCheck={(value) => this.setState({agreementAccepted: value})}>
                                            I accept the <a href={this.getAgreementUrl()} target="_blank" rel="noopener noreferrer">rental agreement</a> and authorize SecūrSpace to electronically debit my account for all payments outlined in this booking.
                                        </CheckBox>
                                    </label>
                            }
                            {
                                this.state.errorMessage ?
                                    <Error>{this.state.errorMessage}</Error>
                                    :
                                    ''
                            }
                        </div>
                        <div className="clear"/>
                    </div>
                    : null
                }
                {this.props.account && this.props.account.id ?
                    <div className="ss-book-space-book-button">
                        <ActionButton
                            label="Book Space"
                            onClick={this.onBookSpaceClick}
                        />
                    </div>
                    : null
                }
            </form>
        )
    }
}

export default BookSpaceForm;
