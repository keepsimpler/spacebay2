import React, {Component} from 'react';
import AccountReport from "./AccountReport";
import moment from "moment/moment";
import {formatCurrencyValue} from "../util/PaymentUtils";
import {toast} from "react-toastify";
import Busy from "../components/Busy";
import {createLogoutOnFailureHandler} from "../util/LogoutUtil";
import AdjustBookingDatesForm from "../components/AdjustBookingDatesForm";
import ModalForm from "../components/ModalForm";
import "../css/views/supplierBookingReport.css";
import CreateBookingPanel from "../components/CreateBookingPanel";
import {FREQUENCY_TYPE_MONTHLY, FREQUENCY_TYPE_WEEKLY, FrequencyOptions} from "../controls/FrequencyOption";
import ConfirmDialog from "../components/ConfirmDialog";
import Select from "../components/Select";
import "../css/views/supplierBookingsReports.css";

const $ = window.$;
const ABM_ACCOUNT_ID = 'e60044bb-d718-4e27-9f71-a6c301a9fa1c';
const TEST_PARTNER_S4_ID = 'aa4a1184-15e4-4b4d-a588-eb2ab5036030'; // eslint-disable-line
const OVERRIDE_ALLOW_CREATE_BOOKING = [
    ABM_ACCOUNT_ID
];
const OVERRIDE_ALLOW_CREATE_BILLED_BOOKING = [

];
const OVERRIDE_ALLOW_UPDATE_BOOKING = [

];

export default class SupplierBookingsReport extends Component {
    constructor(props) {
        super(props);

        this.state = {
            account: this.props.account,
            bookings: [],
            adjustDatesBooking: null,
            adjustEndDateBooking: null,
            adjustSpacesBooking: null,
            showCreateBooking: null,
            selectedBooking: null,
            numberOfSpaces: null
        };

        this.newBooking = {};
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.account !== this.state.account) {
            this.setState({account: nextProps.account});
            this.loadBookings(nextProps.account);
        }
    }

    componentDidMount() {
        this.loadBookings(this.props.account);
    }

    loadBookings = account => {
        if (account && account.id) {
            Busy.set(true);
            $.ajax({
                url: `api/booking/all-supplier-bookings/${account.id}`,
                type: 'GET',
                contentType: 'application/json; charset=UTF-8',
                success: (data) => {
                    this.setState({bookings: data});
                    Busy.set(false);
                },
                statusCode: {
                    401: createLogoutOnFailureHandler(this.props.handleLogout)
                },
                error: (jqXHR) => {
                    Busy.set(false);
                    let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message ? jqXHR.responseJSON.message.trim() : "" : "";
                    toast.error("Failed to load bookings:  " + errorMessage);
                }
            });
        }
    };

    showAdjustDatesView = (booking) => {
        this.setState({
            adjustDatesBooking: booking
        })
    };

    showCreateBookingView = (booking) => {
        this.setState({
            showCreateBooking: true,
            selectedBooking: booking
        })
    };

    closeAllDialogs = (event) => {
        this.setState({
            adjustDatesBooking: null,
            showCreateBooking: null
        });
    };

    adjustDatesCompleted = (booking) => {
        let bookings = this.state.bookings;
        let foundIndex = bookings.findIndex(x => x.id === booking.id);
        bookings[foundIndex] = booking;
        this.setState({bookings: bookings});
        this.closeAllDialogs();
        toast.success('Successfully adjusted dates on booking!');
    };

    newBookingUpdated = (newBooking) => {
        this.newBooking = newBooking;
    };

    cancelBookingModal = () => {
        Busy.set(false);
        this.setState({
            showCancelConfirmation: false,
            bookingBeingCancelled: null
        });
    };

    cancelBooking = (booking) => {
        this.setState({
            showCancelConfirmation: true,
            bookingBeingCancelled: booking.bookingId
        });
    };

    cancelBookingAction = () => {
        Busy.set(true);
        $.ajax({
            url: 'api/booking/cancel',
            data: JSON.stringify({
                id: this.state.bookingBeingCancelled
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: (updatedBooking) => {
                Busy.set(false);
                this.loadBookings(this.props.account);
                this.setState({bookingBeingCancelled: ''});
                toast.success("Successfully cancelled booking " + updatedBooking.orderNumber);
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: (jqXHR, textStatus, errorThrown) => {
                Busy.set(false);
                let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "Internal Server Error";
                errorMessage = errorMessage ? errorMessage.trim() : errorMessage;
                toast.error(errorMessage);
            }
        });
    };

    handleChangeDate = (event) => {
        let value = (event.target.type === 'checkbox') ? event.target.checked : event.target.value;

        this.setState({
            selectedFrequencyTypeOption: value,
            endDate: value.getFormattedEndDate()
        })
    };

    handleChangeSpaces = (event) => {
        let value = (event.target.type === 'checkbox') ? event.target.checked : event.target.value;

        this.setState({
            numberOfSpaces: value
        })
    };

    getUpdatedRecurringProperties = (startDate, recurringBooking, selectedFrequencyType, selectedFrequencyTypeOption) => {
        if (recurringBooking) {
            let frequencyOptions = new FrequencyOptions(startDate);

            let frequencyTypeOptions = frequencyOptions.createOptions(selectedFrequencyType);
            let updatedSelectedFrequencyTypeOption;
            if (selectedFrequencyTypeOption && selectedFrequencyTypeOption.getFrequencyType() === selectedFrequencyType) {
                updatedSelectedFrequencyTypeOption = selectedFrequencyTypeOption.recreatedFromStartDate(startDate);
            } else {
                updatedSelectedFrequencyTypeOption = frequencyTypeOptions[0];
            }

            this.setState({
                frequencyTypeOptions: frequencyTypeOptions,
                selectedFrequencyTypeOption: updatedSelectedFrequencyTypeOption,
                endDate: updatedSelectedFrequencyTypeOption.getFormattedEndDate()
            })
        } else {
            this.setState({
                frequencyTypeOptions: [],
                selectedFrequencyTypeOption: ""
            })
        }
    };

    cancelAdjustEndDate = () => {
        this.setState({
            adjustEndDateBooking: null
        });
    };

    adjustEndDate = () => {
        Busy.set(true);
        $.ajax({
            url: 'api/booking/adjust-end-date',
            data: JSON.stringify({
                bookingId: this.state.adjustEndDateBooking.bookingId,
                endDate: this.state.endDate
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: (updatedBooking) => {
                Busy.set(false);
                this.loadBookings(this.props.account);
                this.setState({adjustEndDateBooking: null});
                toast.success("Successfully adjusted end date for booking " + updatedBooking.orderNumber);
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: (jqXHR, textStatus, errorThrown) => {
                Busy.set(false);
                let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "Internal Server Error";
                errorMessage = errorMessage ? errorMessage.trim() : errorMessage;
                toast.error(errorMessage);
            }
        });
    };

    cancelAdjustSpaces = () => {
        this.setState({
            adjustSpacesBooking: null
        });
    };

    adjustSpaces = () => {
        Busy.set(true);
        $.ajax({
            url: 'api/booking/adjust-number-of-spaces',
            data: JSON.stringify({
                bookingId: this.state.adjustSpacesBooking.bookingId,
                numberOfSpaces: this.state.numberOfSpaces
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: (updatedBooking) => {
                Busy.set(false);
                this.loadBookings(this.props.account);
                this.setState({
                    adjustSpacesBooking: null,
                    numberOfSpaces: null
                });
                toast.success("Successfully adjusted number of spaces to " + updatedBooking.numberOfSpaces + " for booking " + updatedBooking.orderNumber);
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: (jqXHR, textStatus, errorThrown) => {
                Busy.set(false);
                let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "Internal Server Error";
                errorMessage = errorMessage ? errorMessage.trim() : errorMessage;
                toast.error(errorMessage);
            }
        });
    };

    shouldShowCreateBooking = () => {
        return this.isUserAdmin() || this.isOverrideAllowCreateBooking();
    }

    shouldShowCreateBilledBooking = () => {
        return this.isUserAdmin() || this.isOverrideAllowCreateBilledBooking();
    }

    shouldAllowUpdateBooking = () => {
        return this.isUserAdmin() || this.isOverrideAllowUpdateBooking();
    }

    isOverrideAllowCreateBooking = () => {
        return OVERRIDE_ALLOW_CREATE_BOOKING.includes(this.props.account.id);
    }

    isOverrideAllowCreateBilledBooking = () => {
        return OVERRIDE_ALLOW_CREATE_BILLED_BOOKING.includes(this.props.account.id);
    }

    isOverrideAllowUpdateBooking = () => {
        return OVERRIDE_ALLOW_UPDATE_BOOKING.includes(this.props.account.id);
    }

    isGmsSubscriber = () => {
        return this.isGmsLiteSubscriber() || this.isGmsProSubscriber();
    }

    isGmsLiteSubscriber = () => {
        return this.props.account.subscriptionType === "GMS_LITE";
    }

    isGmsProSubscriber = () => {
        return this.props.account.subscriptionType === "GMS_PRO";
    }

    isUserAdmin = () => {
        return this.props.account.userType === 'ADMIN';
    }

    render() {
        let adjustDatesView = (booking) => {
            return (
                <div className="unselectable">
                    <div className="modal-dialog">
                        <div className="modal-content ">
                            <div className="popup-header">
                                <h1>Adjust Booking Dates</h1>
                                <button type="button" className="close pull-right"
                                        aria-label="Close"
                                        onClick={this.closeAllDialogs}>
                                    <img alt="" src="../app-images/close.png"/>
                                </button>
                            </div>
                            <AdjustBookingDatesForm
                                display="popup"
                                booking={booking}
                                closeSubViewHandler={this.closeAllDialogs}
                                onSuccess={this.adjustDatesCompleted}
                            />
                        </div>
                    </div>
                </div>
            )
        };
        return (
            <div className="h-100">
                {
                    this.shouldShowCreateBooking() ?
                        <div className="ss-create-new-booking-button-wrapper">
                            <button type="button"
                                    onClick={this.showCreateBookingView}
                                    className="ss-button-secondary ss-create-new-booking-button">
                                Create New Booking
                            </button>
                        </div>
                        :
                        ''
                }
                {this.state.adjustDatesBooking ? adjustDatesView(this.state.adjustDatesBooking) : ''}
                <AccountReport title="Bookings"
                               parentMenu="Bookings"
                               data={this.state.bookings}
                               defaultSortBy="startDate"
                               defaultSortByDirection="DESC"
                               defaultGroupBy="active"
                               defaultGroupSortDirction="ASC"
                               visibleRecordBatchSize={20}
                               criteriaField="locationName"
                               reportFields={[
                                   {
                                       label: "Booking Number",
                                       name: "orderNumber"
                                   },
                                   {
                                       label: "Customer",
                                       name: "buyerCompanyName"
                                   },
                                   {
                                       label: "Start Date",
                                       name: "startDate",
                                       formatter: (value) => {
                                           return moment(new Date(value)).format('MM/DD/YYYY hh:mm A');
                                       }
                                   },
                                   {
                                       label: "End Date",
                                       name: "endDate",
                                       formatter: (value) => {
                                           if (value === "12/31/2200") {
                                               return "Until cancelled";
                                           } else {
                                               return moment(new Date(value)).format('MM/DD/YYYY hh:mm A');
                                           }
                                       }
                                   },
                                   {
                                       label: "Number of Spaces",
                                       name: "numberOfSpaces"
                                   },
                                   {
                                       label: "Location",
                                       name: "locationName"
                                   },
                                   {
                                       label: "Brokered",
                                       name: "brokered",
                                       formatter: (brokered) => brokered ? "True" : "False"
                                   },
                                   {
                                       label: "Frequency",
                                       name: "frequency",
                                       formatter: (frequency, booking) =>
                                           frequency === 'RECURRING' && booking.durationType === 'WEEKLY' ?
                                               'Recurring - Weekly'
                                               :
                                               frequency === 'RECURRING' && booking.durationType === 'MONTHLY' ?
                                                   'Recurring - Monthly'
                                                   :
                                                   'One-Time'
                                   },
                                   {
                                       label: "Equipment Type",
                                       name: "assetType"
                                   },
                                   {
                                       label: "Initial/Total Charge",
                                       name: "initialSupplierPayoutAmount",
                                       formatter: formatCurrencyValue
                                   },
                                   {
                                       label: "Recurring Charge",
                                       name: "recurringSupplierPayoutAmount",
                                       formatter: (recurringSupplierPayoutAmount, booking) =>
                                           booking.frequency === 'RECURRING' ?
                                               formatCurrencyValue(recurringSupplierPayoutAmount)
                                               :
                                               ''
                                   },
                                   {
                                       label: "Booking Rate",
                                       name: "pricePerDay",
                                       formatter: (rate, booking) =>
                                           booking.brokered ?
                                               ''
                                               :
                                               formatCurrencyValue(rate) + (booking.durationType === 'WEEKLY' ?
                                               ' /week'
                                               :
                                               booking.durationType === 'MONTHLY' ?
                                                   ' /month'
                                                   :
                                                   ' /day')

                                   },
                                   {
                                       label: "Status",
                                       name: "status"
                                   },
                                   {
                                       label: "Active",
                                       name: "active",
                                       formatter: (value) => value ? 'Active' : 'Not Active'
                                   },
                                   {
                                       label: "Created On",
                                       name: "createdOn",
                                       formatter: (value) => {
                                           return moment(new Date(value)).format('MM/DD/YYYY hh:mm A');
                                       }
                                   }
                               ]}
                               actionList={[
                                   {
                                       displayValue: 'Cancel',
                                       action: this.cancelBooking,
                                       shouldShowAction: (booking) => {
                                           const ONE_HOUR = 60 * 60 * 1000;
                                           const TWENTY_FOUR_HOURS = 24 * ONE_HOUR;
                                           let timeBeforeBookingStart = new Date(booking.startDate) - (new Date());
                                           return timeBeforeBookingStart > TWENTY_FOUR_HOURS && $.inArray(booking.status, ['Approved', 'Pending', 'Incomplete']) && this.shouldAllowUpdateBooking();
                                       }
                                   },
                                   {
                                       displayValue: 'Adjust Dates',
                                       action: this.showAdjustDatesView,
                                       shouldShowAction: (booking) => {
                                           return $.inArray(booking.status, ['Approved', 'Active', 'Complete', 'Processing-ACH-Payment']) >= 0 && booking.frequency !== 'RECURRING' && this.shouldAllowUpdateBooking();
                                       }
                                   },
                                   {
                                       displayValue: 'Adjust End Date',
                                       shouldShowAction: (booking) => {
                                           return booking.durationType !== 'DAILY' && $.inArray(booking.status, ['Approved', 'Pending', 'Incomplete', 'Processing-ACH-Payment']) >= 0 && this.shouldAllowUpdateBooking();
                                       },
                                       action: ((booking) => {
                                           if (booking.durationType === 'WEEKLY') {
                                               this.getUpdatedRecurringProperties(booking.startDate, true, FREQUENCY_TYPE_WEEKLY);
                                           } else {
                                               this.getUpdatedRecurringProperties(booking.startDate, true, FREQUENCY_TYPE_MONTHLY);
                                           }

                                           this.setState({adjustEndDateBooking: booking});
                                       })
                                   },
                                   {
                                       displayValue: 'Adjust Number Of Spaces',
                                       shouldShowAction: (booking) => {
                                           return booking.durationType !== 'DAILY' && $.inArray(booking.status, ['Approved', 'Pending', 'Incomplete']) >= 0 && this.shouldAllowUpdateBooking();
                                       },
                                       action: ((booking) => {
                                           this.setState({adjustSpacesBooking: booking});
                                       })
                                   }
                               ]}
                               account={this.state.account}
                />

                <ConfirmDialog showAlert={this.state.showCancelConfirmation}
                               title="Cancel Booking"
                               onClose={this.cancelBookingModal}
                               proceedEventHandler={this.cancelBookingAction}>
                    Are you sure you want to cancel this booking?
                </ConfirmDialog>

                <ModalForm showForm={this.state.showCreateBooking}
                           size="large"
                           title="Create Customer Booking"
                           onClose={() => {
                               this.setState({showCreateBooking: null});
                           }}
                           proceedEventHandler={() => {

                               let errorMessage = '';
                               if (!this.newBooking.buyerAccountId) {
                                   errorMessage = "Please select a Customer";
                               } else if (!this.newBooking.locationId) {
                                   errorMessage = "Please select a Location";
                               } else if (!this.newBooking.numberOfSpaces) {
                                   errorMessage = "Please enter the number of spaces";
                               } else if (!this.newBooking.startDate) {
                                   errorMessage = "Please select a Start Date";
                               } else if (!this.newBooking.assetType) {
                                   errorMessage = "Please select an Equipment Type";
                               } else if (this.newBooking.billedBooking && !this.newBooking.brokeredBuyerChargedPerOccurrence) {
                                   errorMessage = "Please enter the Monthly Customer Charge";
                               } else if (this.newBooking.billedBooking && !this.newBooking.brokeredBuyerOverageRateCharged) {
                                   errorMessage = "Please enter the Customer Overage Rate";
                               }

                               if (errorMessage) {
                                   if (toast.isActive("newBookingValidationError")) {
                                       toast.update("newBookingValidationError", {render: errorMessage});
                                   } else {
                                       toast.error(errorMessage, {toastId: "newBookingValidationError"});
                                   }
                                   return true;
                               }

                               toast.dismiss();
                               Busy.set(true);
                               $.ajax({
                                   url: 'api/booking/zero-dollar-booking',
                                   data: JSON.stringify({
                                       supplierAccountId: this.state.account.id,
                                       buyerAccountId: this.newBooking.buyerAccountId,
                                       locationId: this.newBooking.locationId,
                                       numberOfSpaces: this.newBooking.numberOfSpaces,
                                       startDate: this.newBooking.startDate,
                                       assetType: this.newBooking.assetType,
                                       brokeredBuyerChargedPerOccurrence: this.newBooking.brokeredBuyerChargedPerOccurrence,
                                       brokeredBuyerOverageRateCharged: this.newBooking.brokeredBuyerOverageRateCharged
                                   }),
                                   type: 'POST',
                                   contentType: 'application/json; charset=UTF-8',
                                   dataType: "json",
                                   success: (newBooking) => {
                                       Busy.set(false);
                                       this.setState({
                                           showCreateBooking: null,
                                           bookings: [newBooking].concat(...Object.values(this.state.bookings))
                                       });
                                       toast.success("Successfully created new Customer booking: " + newBooking.orderNumber);
                                   },
                                   statusCode: {
                                       401: createLogoutOnFailureHandler(this.props.handleLogout)
                                   },
                                   error: (jqXHR, textStatus, errorThrown) => {
                                       Busy.set(false);
                                       let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "Internal Server Error";
                                       errorMessage = errorMessage ? errorMessage.trim() : errorMessage;
                                       toast.error(errorMessage);
                                   }
                               });
                           }}
                           textOk='Create Booking'
                           textAlign="pull-right"
                           errorMessage={this.state.errorMessage}>
                    <div id="ss-admin-bookings-report">
                        <CreateBookingPanel newBookingUpdated={this.newBookingUpdated}
                                            account={this.props.account}
                                            allowCreateBilledBooking={this.shouldShowCreateBilledBooking()}
                        />
                    </div>
                </ModalForm>

                <ModalForm showForm={this.state.adjustEndDateBooking}
                           size="large"
                           title="Adjust Booking End Date"
                           onClose={this.cancelAdjustEndDate}
                           proceedEventHandler={this.adjustEndDate}
                           textOk='Save'
                           textAlign="pull-right"
                           errorMessage={this.state.errorMessage}>
                    <div id="ss-supplier-bookings-report" className="hs-field">
                        <label>UNTIL</label>
                        <Select id="selectedFrequencyTypeOption"
                                name="selectedFrequencyTypeOption"
                                handleChange={this.handleChangeDate}
                                selectedOption={this.state.selectedFrequencyTypeOption}
                                placeholder="Choose"
                                options={this.state.frequencyTypeOptions}
                        />
                    </div>
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                </ModalForm>

                <ModalForm showForm={this.state.adjustSpacesBooking}
                           size="large"
                           title="Adjust Booking Number Of Spaces"
                           onClose={this.cancelAdjustSpaces}
                           proceedEventHandler={this.adjustSpaces}
                           textOk='Save'
                           textAlign="pull-right"
                           errorMessage={this.state.errorMessage}>
                    <div id="ss-supplier-bookings-report" className="hs-field">
                        <div className="hs-field w100">
                            <label>NEW NUMBER OF SPACES</label>
                            <input type="text"
                                   className="ss-book-space-form-input"
                                   id="numberOfSpaces"
                                   name="numberOfSpaces"
                                   value={this.state.numberOfSpaces}
                                   onChange={this.handleChangeSpaces}
                                   title="Enter the new number of spaces needed"
                            />
                        </div>
                    </div>
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                </ModalForm>

            </div>
        )
    }
}

