import React, {Component} from 'react';
import '../css/views/booking-common.css';
import '../css/theme/mainContent.css';
import '../css/components/supplierActiveBookings.css';
import {createLogoutOnFailureHandler} from '../util/LogoutUtil'
import Busy from "../components/Busy";
import BookingListItem from "../components/BookingListItem";
import SupplierBookingActionButtons from "../components/SupplierBookingActionButtons";
import CheckInParentControl from "../components/CheckInParentControl";
import Error from "../components/Error";
import URLUtils from "../util/URLUtils";
import Modal from "react-router-modal/lib/modal";
import {toast} from "react-toastify";
import ConfirmDialog from "../components/ConfirmDialog";
import ConfirmDialogBlock from "../components/ConfirmDialogBlock";

const $ = window.$;

const active_AssetTypes = [
    'CONTAINER_LOADED',
    'CONTAINER_EMPTY',
    'CHASSIS_ONLY',
    'TRUCK_TRAILER_LOADED',
    'TRUCK_TRAILER_EMPTY',
    'TRUCK_ONLY',
    'TRAILER_LOADED',
    'TRAILER_EMPTY',
    'REEFER_LOADED_PLUGIN'
];

class SupplierActiveBookings extends Component {
    constructor(props) {
        super(props);

        let initialSearchText = URLUtils.getQueryVariable('bookingNumber');
        if (!initialSearchText) {
            initialSearchText = '';
        }

        this.state = Object.assign(this.props.account, {
            bookings: [],
            bookingIdBeingActioned: "",
            achNotEnabledError: '',
            activeSubview: null,
            searchBox: initialSearchText,
            filteredList: [],
            assetTypes: [],
            showCancelConfirmation: false,
            showCancelConfirmationW: false,
        });

        this.labels = [
            {"label": "customer", "field": "buyerAccount.companyName", "rows": 1},
            {"label": "location", "field": "location.locationName", "rows": 1},
            {"label": "Booking number", "field": "orderNumber", "rows": 1},
            {"label": "booked dates", "field": "startDate", "field2": "endDate", "rows": 1},
            {"label": "EQUIPMENT TYPE", "field": "assetType", "rows": 1},
            {"label": "Spaces booked", "field": "numberOfSpaces", "rows": 1},
            {"label": "Status", "field": "status", "class":"getStatusClass", "rows": 1},
            //{"label": "Current inventory", "field": "", "rows": 2},
        ];

        this.searchKeys = [
            "orderNumber",
            "startDate",
            "endDate",
            "buyerAccount.companyName",
            "location.locationName",
            "status"
        ];
    }


    UNSAFE_componentWillReceiveProps(nextProps) {
        if (typeof nextProps.account.id !=='undefined' &&  nextProps.account !== this.props.account ) {
            this.setState(Object.assign(this.state, nextProps.account));
            this.loadAssetTypes(nextProps.account.id);
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleWindowResize);
        this.loadAssetTypes(this.props.account.id);
    }

    componentWillUnmount(){
        window.removeEventListener('resize', this.handleWindowResize);
    }

    handleWindowResize = () => {
        this.forceUpdate();
    };

    loadAssetTypes = accountId => {
        $.ajax({
            url: 'api/types/assets',
            type: 'GET',
            contentType: 'application/json; charset=UTF-8',
            dataType: 'json',
            success: (assetTypes) => {
               //preserve only active types
                let temp_assetTypes=assetTypes.filter((type)=>{
                    return (active_AssetTypes.indexOf(type.key)>-1);
                });
                this.loadBookings(accountId, temp_assetTypes);
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: this.handleFailure
        });
    };

    loadBookings = (accountId, assetTypes) => {
        if (accountId) {
            Busy.set(true);
            $.ajax({
                 url: 'api/booking?supplierAccountId=' + accountId + '&activeOnly=true',
               // url: 'api/booking?supplierAccountId=' + accountId + '',
                type: 'GET',
                success: (bookings) => {
                    this.bookingsLoaded(bookings, assetTypes)
                },
                statusCode: {
                    401: createLogoutOnFailureHandler(this.props.handleLogout)
                },
                error: this.handleFailure
            });
        }
    };

    bookingsLoaded = (bookings, assetTypes) => {
        if (bookings) {
            //Sort by most recent on top
            bookings = bookings.sort(function (a, b) {
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

            bookings = bookings.filter(item => item.orderNumber !== '1001553');

            for (let i = 0; i < bookings.length; i++) {
                let booking = bookings[i];
                if (!booking.numberOfSpaces) {
                    booking.numberOfSpaces = 0;
                }
                booking.searchText = this.searchKeys.map(key => {
                    let dotIndex = key.indexOf('.');

                    if (dotIndex < 0) {
                        return booking[key];
                    } else {
                        let keyParts = key.split(".");
                        let childRecord = booking[keyParts[0]];
                        return childRecord[keyParts[1]];
                    }
                }).join("").toLocaleLowerCase()
            }
        }

        this.setState({
            bookings: bookings,
            filteredList: bookings,
            assetTypes: assetTypes
        });
        Busy.set(false);
    };

    changeViewHandler = (view, object) => {
        if (view === 'check-in-out-head') {
            this.setState({
                activeSubview: <Modal className="check-in-modal no-padding"
                                      inClassName="check-in-modal-in"
                                      outClassName="check-in-modal-out"
                                      backdropInClassName="check-in-modal-backdrop-in"
                                      backdropOutClassName="check-in-modal-backdrop-out"
                                      backdropClassName="check-in-modal-backdrop"
                                      onBackdropClick={() => this.setState({equipmentTypeSelectorVisible: false})}>

                    <CheckInParentControl booking={object}
                                          accountId={this.props.account.id}
                                          assetTypes={this.state.assetTypes}
                                          closeSubViewHandler={this.closeSubViewHandlerDialog}
                                          saveCompletedCallback={this.saveCompletedCallback}
                                          closeFormHandler={this.closeSubViewHandler}
                    />

                </Modal>

            })
        }
        else {
            this.setState({activeSubview: null});
        }
    };

    closeSubViewHandler = () => {
        this.setState({activeSubview: null});
    };

    closeSubViewHandlerDialog = () => {
        this.setState({showCancelConfirmationW: true});
    };

    saveCompletedCallback = () => {
        this.setState({
            activeSubview: null
        });

        toast.success("Successfully checked in!");

        this.loadAssetTypes(this.props.account.id);
    };

    checkOutCompletedCallback = () => {
        this.setState({
            activeSubview: null
        });

        toast.success("Successfully checked out!");

        this.loadAssetTypes(this.props.account.id);
    };

    searchChangeHandler = event => {
        let name = event.target.name;
        let value = event.target.value;

        let results = value ? this.search(value) : this.state.bookings;
        this.setState({[name]: value, filteredList: results});
    };

    preventFormSubmitOnEnter = event => {

        if (event.which === 13) {
            event.preventDefault();
        }
    };

    search(filterText) {
        let filterTokens = filterText.split(" ").map(value => value.toLocaleLowerCase());

        return this.state.bookings.filter(booking => {
            for (let token of filterTokens) {
                if (!booking.searchText.includes(token)) {
                    return false;
                }
            }
            return true;
        });
    }

    cancelBookingModal = () => {
        Busy.set(false);
        this.setState({
            showCancelConfirmation: false,
            bookingIdBeingActioned: null
        });
    };

    cancelBooking = bookingId => {
        this.setState({showCancelConfirmation:true});
        this.setState({bookingIdBeingActioned:bookingId});
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
            success: this.handleSuccess,
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: this.handleFailure
        });
    };

    handleSuccess = updatedBooking => {
        Busy.set(false);
        this.setState({bookingIdBeingActioned: ""});
        this.setState((prevState) => ({
            bookings: prevState.bookings.filter(booking => {
                return booking.id !== updatedBooking.id;
            }),
            filteredList: prevState.filteredList.filter(booking => {
                return booking.id !== updatedBooking.id;
            }),
        }));
        toast.success("Successfully cancelled booking " + updatedBooking.orderNumber);
    };

    handleFailure = (jqXHR, textStatus, errorThrown) => {
        Busy.set(false);
        if (jqXHR.status === 401) {
            return;
        }
        let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "Internal Server Error";
        errorMessage = errorMessage ? errorMessage.trim() : errorMessage;
        toast.error(errorMessage);
    };

    render() {

        return (
            <div className='hs-bookings-container grey-bg h-100'>
                <div>
                    <header>
                        <ul className="breadcrumb">
                            <li>Gate Management</li>
                            <li>Check In</li>
                        </ul>
                        <h1 className="content-header-title">Equipment Check In</h1>
                    </header>
                    <ConfirmDialogBlock
                        showAlert={this.state.showCancelConfirmationW}
                        title="Confirmation"
                        onClose={() => {
                            this.setState({showCancelConfirmationW: false})
                        }}
                        proceedEventHandler={this.closeSubViewHandler}>
                        Are you sure you want to cancel?
                    </ConfirmDialogBlock>

                    {this.state.activeSubview ? this.state.activeSubview :
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
                                            <i className="fa fa-search"></i>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <ConfirmDialog showAlert={this.state.showCancelConfirmation}
                                           title="Cancel Booking"
                                           onClose={this.cancelBookingModal}
                                           proceedEventHandler={this.cancelBookingAction}>
                                Are you sure you want to cancel this booking?
                            </ConfirmDialog>

                            {this.state.filteredList.map((booking, index) =>
                                <div id={booking.id} className="ss-booking-container" key={index}>

                                    <BookingListItem
                                        account={this.props.account}
                                        labels={this.labels}
                                        booking={booking}
                                    >
                                        <SupplierBookingActionButtons booking={booking}
                                                                      account={this.props.account}
                                                                      changeViewHandler={this.changeViewHandler}
                                                                      cancelBooking={this.cancelBooking}
                                        />
                                    </BookingListItem>
                                    <div className={booking.numberOfSpaces <= booking.locationInventoryCount ? 'ss-booking-details' : 'hidden'} >
                                        {booking.numberOfSpaces <= booking.locationInventoryCount ?
                                            <Error>Booking at or above capacity!</Error> : ''}
                                    </div>
                                </div>
                            )}

                            <div className='ss-supplier-active-bookings-endlist'>
                                <h6>You have reached the end of the list</h6>
                            </div>
                        </div>
                    }
                </div>

            </div>
        )
    }
}

export default SupplierActiveBookings;
