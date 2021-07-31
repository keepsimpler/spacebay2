import React, {Component} from 'react';
import {formatCurrencyValue} from '../util/PaymentUtils';
import '../css/views/booking-common.css';
import '../css/theme/mainContent.css';
import '../css/theme/forms.css';
import '../css/theme/forms-block.css';
import '../css/theme/buttons.css';
// import '../css/components/approvals.css';
import {createLogoutOnFailureHandler} from '../util/LogoutUtil'
import Busy from "../components/Busy";
import URLUtils from "../util/URLUtils";
import Error from "../components/Error";
import {toast} from "react-toastify";
import BookingListItem from "../components/BookingListItem";
import {BookingReasonDeclined} from "../components/constants/securspace-constants";

const $ = window.$;

class Approvals extends Component {
    constructor(props) {
        super(props);

        let initialSearchText = URLUtils.getQueryVariable('bookingNumber');
        if (!initialSearchText) {
            initialSearchText = '';
        }

        this.state = {
            bookings: [],
            searchBox: initialSearchText,
            filteredList: [],
            bookingIdBeingActioned: ""
        };

        this.labels = [
            {"label": "customer", "field": "buyerAccount.companyName", "rows": 1},
            {"label": "location", "field": "location.locationName", "rows": 1},
            {"label": "booked dates", "field": "startDate", "field2": "endDate", "rows": 1},
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
            {
                "label": "Brokered",
                "field": "",
                "valueF": function (booking) {
                    return (booking.brokered ? "True" : "False");
                },
                "rows": 1
            },
            {"label": "EQUIPMENT TYPE", "field": "assetType", "rows": 2},
            {"label": "Booking number", "field": "orderNumber", "rows": 1},
            {"label": "Spaces booked", "field": "numberOfSpaces", "rows": 1},
            {"label": "Status", "field": "status", "class": "getStatusClass", "rows": 1},
            {
                "label": function (booking) {
                    return booking.frequency === 'RECURRING' ? 'Initial Charge' : 'Total Cost';
                },
                "field": "",
                "valueF": function (booking) {
                    return formatCurrencyValue(booking.initialSupplierPayoutAmount);
                },
                "rows": 1
            },
            {
                "label": function (booking) {
                    return (booking.frequency === 'RECURRING' ? Approvals.getOccurrenceLabel(booking) + ' Charge' : '');
                },
                "field": "",
                "valueF": function (booking) {
                    return booking.frequency === 'RECURRING' ?
                        formatCurrencyValue(booking.recurringSupplierPayoutAmount) : '';
                },
                "rows": 1
            },
            {
                "label": function (booking) {
                    return booking.brokeredSupplierPaidPerOccurrence ? '' : 'Rate';
                },
                "field": "",
                "valueF": function (booking) {
                    return (booking.brokeredSupplierPaidPerOccurrence ? ''
                            : formatCurrencyValue(booking.rate) + ' ' +
                            (booking.durationType === 'WEEKLY' ? ' /week' : booking.durationType === 'MONTHLY' ? ' /month' : ' /day')
                    )
                },
                "rows": 1
            },
            {
                "label": "Overage Rate",
                "field": "",
                "valueF": function (booking) {
                    return ( booking.brokeredSupplierOverageRatePaid ?
                        formatCurrencyValue(booking.brokeredSupplierOverageRatePaid)
                        :
                        formatCurrencyValue(booking.location.pricePerDay));
                },
                "rows": 1
            }
        ];

        this.searchKeys = [
            "orderNumber",
            "startDate",
            "endDate",
            "buyerAccount.companyName",
            "supplierAccount.companyName",
            "location.locationName",
            "status",
            "frequency",
            "durationType",
            "rateSearchText",
            "initialChargeSearchText",
            "recurringChargeSearchText",
            "brokeredSupplierPaidPerOccurrenceSearchText",
            "brokeredSupplierOverageRatePaidSearchText",
            "overageRateSearchText"
        ];
    }



    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.account !== nextProps.account) {
            this.reloadApprovals(nextProps.account ? nextProps.account.id : null);
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleWindowResize);
        this.reloadApprovals(this.props.account ? this.props.account.id : null);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowResize);
    }

    handleWindowResize = () => {
        this.forceUpdate();
    };

    reloadApprovals = accountId => {
        if (accountId) {
            Busy.set(true);
            $.ajax({
                url: 'api/booking?supplierAccountId=' + accountId + '&approvalsOnly=true',
                type: 'GET',
                success: this.bookingsLoaded,
                statusCode: {
                    401: createLogoutOnFailureHandler(this.props.handleLogout)
                },
                error: this.bookingsFailedToLoad
            });
        }
    };

    bookingsLoaded = data => {
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

            for (let i = 0; i < data.length; i++) {
                let booking = data[i];
                if (!booking.numberOfSpaces) {
                    booking.numberOfSpaces = 0;
                }
            }
            for (let i = 0; i < data.length; i++) {
                let booking = data[i];
                //Add the search fields that have additional format before the searchText is generated for this booking
                booking.rateSearchText = booking.rate && !booking.brokered ? formatCurrencyValue(booking.rate) : "";
                booking.overageRateSearchText = booking.brokeredSupplierOverageRatePaid ? formatCurrencyValue(booking.brokeredSupplierOverageRatePaid) : formatCurrencyValue(booking.location.pricePerDay);
                booking.initialChargeSearchText = booking.initialSupplierPayoutAmount ? formatCurrencyValue(booking.initialSupplierPayoutAmount) : "";
                booking.recurringChargeSearchText = booking.recurringSupplierPayoutAmount ? formatCurrencyValue(booking.recurringSupplierPayoutAmount) : "";
                booking.brokeredSupplierPaidPerOccurrenceSearchText = booking.brokeredSupplierPaidPerOccurrence ? formatCurrencyValue(booking.brokeredSupplierPaidPerOccurrence) : "";
                booking.brokeredSupplierOverageRatePaidSearchText = booking.brokeredSupplierOverageRatePaid ? formatCurrencyValue(booking.brokeredSupplierOverageRatePaid) : "";

                booking.searchText = this.searchKeys.map(key => {
                    let dotIndex = key.indexOf('.');

                    if (dotIndex < 0) {
                        return booking[key];
                    } else {
                        let keyParts = key.split(".");
                        let childRecord = booking[keyParts[0]];
                        return childRecord[keyParts[1]];
                    }
                }).join("").toLocaleLowerCase();
            }
        }

        let _this = this;

        Busy.set(false);
        this.setState({
            bookings: data,
            filteredList: data
        }, function () {
            _this.initDatePickers();
        }, () => {
            this.search(this.state.searchBox);
        });
    };

    initDatePickers = () => {
        $('.start-date').datepicker({}).on('changeDate', this.createOnBookingDateChange('startDate'));
        $('.end-date').datepicker({}).on('changeDate', this.createOnBookingDateChange('endDate'));
    };

    createOnBookingDateChange(fieldName) {
        let _this = this;
        return function (event) {
            let changedBookingId = event.target.name;
            let newValue = event.target.value;
            _this.setState({
                bookings: _this.state.bookings.map(booking => {
                    return {
                        ...booking,
                        [fieldName]: booking.id === changedBookingId ? newValue : booking[fieldName]
                    };
                }),
                filteredList: _this.state.filteredList.map(booking => {
                    return {
                        ...booking,
                        [fieldName]: booking.id === changedBookingId ? newValue : booking[fieldName]
                    };
                })
            });
        }
    }

    bookingsFailedToLoad = (jqXHR, textStatus, errorThrown) => {
        Busy.set(false);
        toast.error("Failed to load bookings.");
    };

    handleChange = event => {
        this.setState({[event.target.name]: event.target.value});
    };

    searchChangeHandler = event => {
        this.search(event.target.value);
    };

    search(filterText) {
        let results;
        if (filterText) {
            let filterTokens = filterText.split(" ").map(value => value.toLocaleLowerCase());

            results = this.state.bookings.filter(booking => {
                for (let token of filterTokens) {
                    if (!booking.searchText.includes(token)) {
                        return false;
                    }
                }
                return true;
            });
        } else {
            results = this.state.bookings;
        }

        this.setState({
            searchBox: filterText,
            filteredList: results
        });
    }

    adjustBookingDates = booking => {
        Busy.set(true);
        this.setState({
            bookingIdBeingActioned: booking.id
        });
        $.ajax({
            url: 'api/booking/adjust-dates',
            data: JSON.stringify({
                bookingId: booking.id,
                startDate: booking.startDate,
                endDate: booking.endDate
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
    };

    approveBooking = bookingId => {
        this.updateBookingStatus(bookingId, 'Approved', null);
    };

    declineBooking = (bookingId, reason) => {
        this.updateBookingStatus(bookingId, 'Declined', reason);
    };

    updateBookingStatus(bookingId, status, reason) {
        Busy.set(true);
        this.setState({
            bookingIdBeingActioned: bookingId
        });
        $.ajax({
            url: 'api/booking/' + (status === 'Approved' ? 'approve' : 'decline'),
            data: JSON.stringify({
                id: bookingId,
                reasonDeclined: reason
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: this.createHandleSuccess(status),
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: this.handleFailure
        });
    }

    createHandleSuccess(status) {
        return (updatedBooking) => {
            Busy.set(false);
            this.setState({
                bookingIdBeingActioned: "",
                bookings: this.state.bookings.map(booking => {
                    if (booking.id === updatedBooking.id) {
                        return updatedBooking;
                    } else {
                        return booking;
                    }
                }),
                filteredList: this.state.filteredList.map(booking => {
                    if (booking.id === updatedBooking.id) {
                        return updatedBooking;
                    } else {
                        return booking;
                    }
                })
            }, () => {
                this.initDatePickers();
            });
            this.props.readPendingBooking();
            toast.success("Successfully " + status + " booking " + updatedBooking.orderNumber);
        };
    }

    handleFailure = (jqXHR, textStatus, errorThrown) => {
        Busy.set(false);
        let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "Internal Server Error";
        errorMessage = errorMessage ? errorMessage.trim() : errorMessage;

        if (errorMessage && errorMessage.startsWith("com.stripe.exception.CardException: The customer's bank account must be verified in order to create an ACH payment.")) {
            errorMessage = "The Customer's bank account must be verified in order to Approve this Booking."
        }

        toast.error(errorMessage);
        this.initDatePickers();
    };

    static getOccurrenceLabel(booking) {
        return booking.frequency === 'RECURRING' && booking.durationType === 'WEEKLY' ?
            'Weekly'
            :
            booking.frequency === 'RECURRING' && booking.durationType === 'MONTHLY' ?
                'Monthly'
                :
                'Daily';
    }

    preventFormSubmitOnEnter(event) {
        if (event.which === 13) {
            event.preventDefault();
        }
    }

    showPopupF = booking => {
        $('#' + booking.id).toggleClass('show');
    };

    render() {
        let _this = this;
        return (
            <div className="grey-bg hs-bookings-container h-100">
                <div>
                    <header>
                        <ul className="breadcrumb">
                            <li>Bookings</li>
                            <li>Approvals</li>
                        </ul>
                        <h1 className="content-header-title">Approvals</h1>
                    </header>

                    <div>
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
                                        <i className="fa fa-search"/>
                                    </div>
                                </div>
                            </form>
                        </div>
                        {this.state.filteredList.map((booking, index) =>
                            <div className="ss-booking-container" key={index}>

                                <BookingListItem
                                    account={this.props.account}
                                    labels={this.labels}
                                    booking={booking}
                                    key={booking.id + '-' + booking.status}
                                >
                                    {
                                      booking.status === 'Pending' ?
                                            <div className="ss-booking-button-container">
                                                <button className="ss-button-danger"
                                                        onClick={() => this.declineBooking(booking.id, BookingReasonDeclined.PARTNER_DECLINED)}>Decline
                                                </button>
                                                <button className="ss-button-primary"
                                                        onClick={() => this.approveBooking(booking.id)}>Approve
                                                </button>
                                            </div>
                                            :
                                            booking.status === 'Incomplete' ?
                                                <div className="ss-booking-button-container">
                                                    <button className="ss-button-danger"
                                                            onClick={() => this.declineBooking(booking.id, BookingReasonDeclined.PARTNER_DECLINED)}>Decline
                                                    </button>
                                                </div>
                                                :
                                                $.inArray(booking.status, ['Approved', 'Active', 'Complete']) >= 0 && booking.frequency !== 'RECURRING' ?
                                                    <div className="ss-booking-button-container">
                                                        <button type="button" className="ss-button-primary"
                                                                onClick={() => _this.showPopupF(booking)}>
                                                            Adjust Booking Dates
                                                        </button>
                                                    </div>
                                                    :
                                                    null

                                    }
                                    {$.inArray(booking.status, ['Approved', 'Active', 'Complete']) >= 0 && booking.frequency !== 'RECURRING' ?

                                        <div id={booking.id} className='modal fade hide'>
                                            <div className="modal-dialog">
                                                <div className="modal-content">
                                                    <div className="popup-header">
                                                        <img alt=""
                                                             src="https://s3-us-west-1.amazonaws.com/securspace-files/app-images/login.png"/>
                                                        <h1>Adjust Booking Dates</h1>
                                                        <button type="button" className="close pull-right"
                                                                aria-label="Close"
                                                                onClick={() => _this.showPopupF(booking)}>
                                                            <img alt="" src="../app-images/close.png"/>
                                                        </button>
                                                    </div>
                                                    <form className="no-padding">
                                                        <div className="modal-body">

                                                            <p className="ss-summary"></p>
                                                            <p className="ss-adjust-dates-details ss-details">If the
                                                                actual drop-off or pickup occurs earlier or later than
                                                                the
                                                                Booking Dates, you can correct them here. This will
                                                                adjust
                                                                the
                                                                charge to the Customer.</p>
                                                            <br/>
                                                            <div className="ss-fieldset-row for-hs-field">
                                                                <div id="searchStartDateItem" className="hs-field">
                                                                    <label>FROM</label>
                                                                    <input type="text"
                                                                           className="start-date ss-inline-start-date"
                                                                           data-date-autoclose="true"
                                                                           name={booking.id}
                                                                           value={booking.startDate}
                                                                           title="Enter the date when whe assets will be dropped off"
                                                                           placeholder="MM/DD/YYYY"
                                                                    />
                                                                </div>

                                                                <div id="searchEndDateItem"
                                                                     className="hs-field">
                                                                    <label
                                                                        className="ss-inline-end-date-label">UNTIL</label>
                                                                    <input type="text"
                                                                           className="end-date ss-inline-end-date"
                                                                           data-date-autoclose="true"
                                                                           name={booking.id}
                                                                           value={booking.endDate}
                                                                           title="Enter the date when you will pick up the assets being stored"
                                                                           placeholder="MM/DD/YYYY"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="modal-footer">
                                                            <div className="table text-center">
                                                                <button type="button" className="ss-button-secondary"
                                                                        onClick={() => _this.showPopupF(booking)}>
                                                                    Cancel
                                                                </button>
                                                                <button type="button" className="ss-button-primary"
                                                                        onClick={() => this.adjustBookingDates(booking)}>
                                                                    Submit
                                                                </button>
                                                            </div>
                                                        </div>

                                                    </form>
                                                </div>
                                            </div>
                                        </div>

                                        :
                                        null}
                                </BookingListItem>
                                <div
                                    className={booking.numberOfSpaces <= booking.locationInventoryCount ? 'ss-booking-details' : 'hidden'}>
                                    {booking.numberOfSpaces <= booking.locationInventoryCount ?
                                        <Error>Booking at or above capacity!</Error> : ''}

                                </div>
                            </div>
                        )}

                        <div className='ss-supplier-active-bookings-endlist'>
                            <h6>You have reached the end of the list</h6>
                        </div>
                    </div>
                </div>

            </div>
        )
    }
}

export default Approvals;
