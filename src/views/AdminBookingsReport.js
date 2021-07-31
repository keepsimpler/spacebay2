import React, {Component} from 'react';
import AccountReport from "./AccountReport";
import moment from "moment/moment";
import {formatCurrencyValue} from "../util/PaymentUtils";
import {createLogoutOnFailureHandler} from "../util/LogoutUtil";
import Busy from "../components/Busy";
import {toast} from "react-toastify";
import { SubscriptionType } from "../components/constants/securspace-constants";
import ConfirmDialog from "../components/ConfirmDialog";
import ModalForm from "../components/ModalForm";
import Select from "../components/Select";
import {FREQUENCY_TYPE_MONTHLY, FREQUENCY_TYPE_WEEKLY, FrequencyOptions} from "../controls/FrequencyOption";
import "../css/views/adminBookingsReports.css";
import {NavLink, Redirect} from "react-router-dom";
import URLUtils from "../util/URLUtils";

const $ = window.$;

export default class AdminBookingsReport extends Component {
    constructor(props) {
        super(props);

        let initialSearchText = URLUtils.getQueryVariable('bookingNumber');
        if (!initialSearchText) {
            initialSearchText = '';
        }

        this.state = {
            account: this.props.account,
            reloadData: false,
            showAdjustDate: false,
            initialSearchText: initialSearchText
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.account !== this.state.account) {
            this.setState({account: nextProps.account});
        }
    }

    cancelBookingModal = () => {
        Busy.set(false);
        this.setState({
            showCancelConfirmation: false,
            bookingIdBeingActioned: null
        });
    };

    cancelToggleChargeOveragesModal = () => {
        Busy.set(false);
        this.setState({
            showToggleChargeOveragesConfirmation: false,
            bookingIdBeingActioned: null
        });
    };

    cancelSetPaymentToManualModal = () => {
        Busy.set(false);
        this.setState({
            showSetPaymentToManualConfirmation: false,
            bookingIdBeingActioned: null
        });
    };

    cancelAdjustDate = () => {
        this.setState({
            showAdjustDate: false
        });
    };

    cancelBooking = booking => {
        this.setState({
            showCancelConfirmation: true,
            bookingIdBeingActioned: booking.bookingId
        });
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
            success: (updatedBooking) => {
                Busy.set(false);
                this.setState({reloadData: true});
                this.setState({bookingIdBeingActioned: ''});
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

    adjustDate = () => {
        Busy.set(true);
        $.ajax({
            url: 'api/booking/adjust-end-date',
            data: JSON.stringify({
                bookingId: this.state.showAdjustDate.bookingId,
                endDate: this.state.endDate
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: (updatedBooking) => {
                Busy.set(false);
                this.setState({reloadData: true});
                this.setState({showAdjustDate: null});
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

    handleChangeDate = event => {
        let value = (event.target.type === 'checkbox') ? event.target.checked : event.target.value;

        this.setState({
            selectedFrequencyTypeOption: value,
            endDate: value.getFormattedEndDate()
        })
    };

    getUpdatedRecurringProperties(startDate, recurringBooking, selectedFrequencyType, maxNumberOfIterations) {
        if (recurringBooking) {
            let frequencyOptions = new FrequencyOptions(startDate);

            let frequencyTypeOptions = frequencyOptions.createOptions(selectedFrequencyType, maxNumberOfIterations, true);
            let updatedSelectedFrequencyTypeOption = frequencyTypeOptions[0];

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
    }

    toggleChargeOverages = booking => {
        this.setState({
            showToggleChargeOveragesConfirmation: true,
            bookingIdBeingActioned: booking.bookingId
        });
    };

    toggleChargeOveragesAction = () => {
        Busy.set(true);
        $.ajax({
            url: 'api/booking/toggle-charge-overages',
            data: JSON.stringify({
                id: this.state.bookingIdBeingActioned
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: (updatedBooking) => {
                Busy.set(false);
                this.setState({
                    reloadData: true,
                    bookingIdBeingActioned: ''
                });
                toast.success("Successfully toggled charging overages for booking " + updatedBooking.orderNumber);
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

    setPaymentToManual = booking => {
        this.setState({
            showSetPaymentToManualConfirmation: true,
            bookingIdBeingActioned: booking.bookingId
        });
    };

    setPaymentToManualAction = () => {
        Busy.set(true);
        $.ajax({
            url: 'api/booking/set-to-manual-payment',
            data: JSON.stringify({
                id: this.state.bookingIdBeingActioned
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: (updatedBooking) => {
                Busy.set(false);
                this.setState({
                    reloadData: true,
                    bookingIdBeingActioned: ''
                });
                toast.success("Successfully set payment to manual collection for booking " + updatedBooking.orderNumber);
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

    dataReloaded = () => {
        this.setState({reloadData: false});
    };

    render() {
        let yesOrNo = function (value) {
            return value ? 'Yes' : 'No'
        };
        return (
            <div className="h-100">
                {
                    this.state.navToPage ?
                        <Redirect to={{
                            pathname: this.state.navToPage,
                            search: this.state.navToSearch
                        }} />
                        :
                        ''
                }
                <AccountReport title="Bookings"
                               getReportDataUrl={(account) => `api/admins/bookings`}
                               reloadData={this.state.reloadData}
                               dataReloaded={this.dataReloaded}
                               initialSearchText={this.state.initialSearchText}
                               defaultSortBy="orderNumber"
                               defaultSortByDirection="DESC"
                               reportFields={[
                                   {
                                       label: "Booking Number",
                                       name: "orderNumber"
                                   },
                                   {
                                       label: "Partner",
                                       name: "supplierCompanyName"
                                   },
                                   {
                                       label: "Customer",
                                       name: "buyerCompanyName"
                                   },
                                   {
                                       label: "Location",
                                       name: "locationName"
                                   },
                                   {
                                       label: "Number of Spaces",
                                       name: "numberOfSpaces"
                                   },
                                   {
                                       label: "Brokered",
                                       name: "brokered",
                                       formatter: yesOrNo
                                   },
                                   {
                                       label: "Duration Type",
                                       name: "durationType"
                                   },
                                   {
                                       label: "Start Date",
                                       name: "startDate",
                                       formatter: (value) => {
                                           return moment(new Date(value)).format('MM/DD/YYYY');
                                       }
                                   },
                                   {
                                       label: "End Date",
                                       name: "endDate",
                                       formatter: (value) => {
                                           return moment(new Date(value)).format('MM/DD/YYYY');
                                       }
                                   },
                                   {

                                       label: "Extended/Date Adjusted",
                                       name: "endDateAdjusted",
                                       formatter: (value) => {
                                           if (value === true) {
                                               return 'Yes';
                                           } else {
                                               return 'No';
                                           }
                                       }
                                   },
                                   {
                                       label: "Rate Per Space",
                                       name: "brokeredBuyerChargedPerOccurrence",
                                       formatter: (value, item) => {
                                           let supplierPaidPerOccurrence = 0;
                                           if (item.recurringCharge) {
                                               supplierPaidPerOccurrence = item.recurringCharge;
                                           } else if (item.initialPaymentAmount) {
                                               supplierPaidPerOccurrence = item.initialPaymentAmount / item.duration;
                                           }
                                           let numberOfSpaces = item.numberOfSpaces;
                                           return supplierPaidPerOccurrence ? formatCurrencyValue((Math.round(supplierPaidPerOccurrence / numberOfSpaces)).toString()) : 0;
                                       }
                                   },
                                   {
                                       label: "Partner Rate",
                                       name: "brokeredSupplierPaidPerOccurrence",
                                       formatter: (value, item) => {
                                           let supplierPaidPerOccurrence = 0;
                                           if (item.recurringSupplierPayoutAmount) {
                                               supplierPaidPerOccurrence = item.recurringSupplierPayoutAmount;
                                           } else if (item.initialSupplierPayoutAmount) {
                                               supplierPaidPerOccurrence = item.initialSupplierPayoutAmount / item.duration;
                                           }
                                           let numberOfSpaces = item.numberOfSpaces;
                                           return supplierPaidPerOccurrence ? formatCurrencyValue((Math.round(supplierPaidPerOccurrence / numberOfSpaces)).toString()) : 0;
                                       }
                                   },
                                   {
                                       label: "Initial Payment Amount",
                                       name: "initialPaymentAmount",
                                       formatter: formatCurrencyValue
                                   },
                                   {
                                       label: "Total Customer Amount",
                                       name: "initialCharge",
                                       formatter: formatCurrencyValue
                                   },
                                   {
                                       label: "Initial SecurSpace Amount",
                                       name: "securspaceFeeAmount",
                                       formatter: formatCurrencyValue
                                   },
                                   {
                                       label: "Initial Payment Processor Fee",
                                       name: "initialPaymentProcessorFee",
                                       formatter: formatCurrencyValue
                                   },
                                   {
                                       label: "Initial SecurSpace Amount",
                                       name: "securspaceFeeAmount",
                                       formatter: formatCurrencyValue
                                   },
                                   {
                                       label: "Initial Partner Payout Amount",
                                       name: "initialSupplierPayoutAmount",
                                       formatter: formatCurrencyValue
                                   },
                                   {
                                       label: "SecurSpace Percentage",
                                       name: "securSpacePercentage",
                                       formatter: (value) => `${value ? value : 0}%`
                                   },
                                   {
                                       label: "GMS Yard",
                                       name: "subscriptionType",
                                       formatter: (value) => {
                                           if (value === SubscriptionType.GMS_PRO || SubscriptionType.GMS_LITE) {
                                               return 'Yes';
                                           } else {
                                               return 'No';
                                           }
                                       }
                                   },
                                   {
                                       label: "Status",
                                       name: "status"
                                   },
                                   {
                                       label: "Created On",
                                       name: "createdOn",
                                       formatter: (value) => {
                                           return moment(new Date(value)).format('MM/DD/YYYY hh:mm A');
                                       }
                                   },
                                   {
                                       label: "Created By",
                                       name: "createdBy"
                                   },
                                   {
                                       label: "First Payment Made",
                                       name: "firstPaymentDate",
                                       formatter: (value) => {
                                           return value ? moment(new Date(value)).format('MM/DD/YYYY hh:mm A') : '';
                                       }
                                   },
                                   {
                                       label: "Charge Overages",
                                       name: "chargeOverages",
                                       formatter: (value) => {
                                           return value ? "True" : "False";
                                       }
                                   },
                                   {
                                       label: "Reason Declined",
                                       name: "reasonDeclined",
                                   },
                                   {
                                       name: "viewInvoices",
                                       link: (booking) => {
                                           return (
                                               <NavLink to={{
                                                       pathname: '/admin-invoices',
                                                       search: "bookingNumber=" + booking.orderNumber
                                                   }}>
                                                   View Invoices
                                               </NavLink>
                                           );
                                       }
                                   }
                               ]}
                               actionList={
                                   [
                                       {
                                           displayValue: 'Cancel',
                                           action: this.cancelBooking,
                                           shouldShowAction: (booking) => {
                                               const ONE_HOUR = 60 * 60 * 1000;
                                               const TWENTY_FOUR_HOURS = 24 * ONE_HOUR;
                                               let timeBeforeBookingStart = new Date(booking.startDate) - (new Date());
                                               return timeBeforeBookingStart > TWENTY_FOUR_HOURS ||
                                                   ["lance@secur.space", "jocelyn@secur.space", "adam@secur.space",
                                                       "jordan@secur.space", "chelsey@secur.space", "bobby@secur.space",
                                                       "ebufler@envasetechnologies.com", "emily@secur.space"
                                                   ]
                                                       .includes(this.props.account.username);
                                           }
                                       },
                                       {
                                           displayValue: 'Adjust End Date',
                                           shouldShowAction: (item) => {
                                               return (item.durationType !== 'DAILY');
                                           },
                                           action: ((item) => {
                                               if (item.durationType === 'WEEKLY') {
                                                   this.getUpdatedRecurringProperties(item.startDate, true, FREQUENCY_TYPE_WEEKLY, 156);
                                               } else {
                                                   this.getUpdatedRecurringProperties(item.startDate, true, FREQUENCY_TYPE_MONTHLY, 36);
                                               }

                                               this.setState({showAdjustDate: item});
                                           })
                                       },
                                       {
                                           displayValue: 'Toggle Charge Overages',
                                           action: this.toggleChargeOverages,
                                       },
                                       {
                                           displayValue: 'Set To Manual Payment',
                                           action: this.setPaymentToManual,
                                       }
                                   ]
                               }
                               account={this.state.account}
                />

                <ConfirmDialog showAlert={this.state.showCancelConfirmation}
                               title="Cancel Booking"
                               onClose={this.cancelBookingModal}
                               proceedEventHandler={this.cancelBookingAction}>
                    Are you sure you want to cancel this booking?
                </ConfirmDialog>

                <ConfirmDialog showAlert={this.state.showToggleChargeOveragesConfirmation}
                               title="Toggle Charge Overages"
                               onClose={this.cancelToggleChargeOveragesModal}
                               proceedEventHandler={this.toggleChargeOveragesAction}>
                    Are you sure you want to toggle charging overages for this booking?
                </ConfirmDialog>

                <ConfirmDialog showAlert={this.state.showSetPaymentToManualConfirmation}
                               title="Set Payment To Manual"
                               onClose={this.cancelSetPaymentToManualModal}
                               proceedEventHandler={this.setPaymentToManualAction}>
                    Are you sure you want to set payment to manual collection for this booking?
                </ConfirmDialog>

                <ModalForm showForm={this.state.showAdjustDate}
                           size="large"
                           title="Adjust Booking End Date"
                           onClose={this.cancelAdjustDate}
                           proceedEventHandler={this.adjustDate}
                           textOk='Save'
                           textAlign="pull-right"
                           errorMessage={this.state.errorMessage}>
                    <div id="ss-admin-bookings-report" className="hs-field">
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
            </div>
        )
    }
}

